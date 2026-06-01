/**
 * Salesforce SlipStream - Background Service Worker
 * Handles session ID extraction via Chrome Cookies API
 * Based on working popup.js pattern
 */

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.type);

  if (request.type === 'GET_AUTH_INFO') {
    getAuthInfo(sender.tab)
      .then(authInfo => {
        console.log('✅ Auth info retrieved:', authInfo);
        sendResponse({ success: true, data: authInfo });
      })
      .catch(error => {
        console.error('❌ Failed to get auth info:', error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate async response
    return true;
  }

  if (request.type === 'MAKE_API_CALL') {
    makeAPICall(request.url, request.sessionId, request.method, request.body)
      .then(data => {
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('❌ API call failed:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});

/**
 * Get authentication info (domain + session ID) from current tab
 * Based on working popup.js pattern
 */
async function getAuthInfo(tab) {
  if (!tab || !tab.url) {
    throw new Error('No active tab found');
  }

  const currentHost = tab.url.split('/')[2];
  const currentOrigin = `https://${currentHost}`;

  console.log('🔍 Analyzing tab URL:', currentHost);

  // Validate Salesforce page
  const isValidSalesforcePage = [
    '.lightning.force.com',
    '.vf.force.com',
    '.salesforce.com',
    '.my.salesforce.com',
    '.sandbox.my.salesforce.com',
    '.visual.force.com',
    '.salesforce-setup.com'
  ].some(domain => currentHost.endsWith(domain));

  if (!isValidSalesforcePage) {
    throw new Error('Please run this extension on a Salesforce page');
  }

  // Translate domain to API domain (CRITICAL for Setup pages!)
  let apiHost = currentHost;

  if (currentHost.includes('.sandbox.lightning.force.com')) {
    apiHost = currentHost.replace('.sandbox.lightning.force.com', '.sandbox.my.salesforce.com');
  } else if (currentHost.includes('.sandbox.salesforce-setup.com')) {
    // THIS IS YOUR CASE! Setup domain → API domain
    apiHost = currentHost.replace('.sandbox.salesforce-setup.com', '.sandbox.my.salesforce.com');
  } else if (currentHost.includes('.lightning.force.com')) {
    apiHost = currentHost.replace('.lightning.force.com', '.my.salesforce.com').replace('--c', '');
  } else if (currentHost.includes('.salesforce-setup.com')) {
    apiHost = currentHost.replace('.salesforce-setup.com', '.my.salesforce.com');
  }

  const salesforceDomain = `https://${apiHost}`;

  console.log('🔧 API Domain:', salesforceDomain);
  console.log('🔧 UI Domain:', currentOrigin);

  // Try to get session cookie from API domain (most reliable)
  let sessionCookie = await chrome.cookies.get({
    url: salesforceDomain,
    name: 'sid'
  });

  if (sessionCookie && sessionCookie.value) {
    console.log('✅ Session cookie found from API domain');
    return {
      domain: salesforceDomain,
      sessionId: sessionCookie.value,
      uiDomain: currentOrigin
    };
  }

  // Fallback: Try UI domain
  sessionCookie = await chrome.cookies.get({
    url: currentOrigin,
    name: 'sid'
  });

  if (sessionCookie && sessionCookie.value) {
    console.log('⚠️ Session cookie found from UI domain (fallback)');
    return {
      domain: currentOrigin,
      sessionId: sessionCookie.value,
      uiDomain: currentOrigin
    };
  }

  // Final fallback: Try all cookies
  const allCookies = await chrome.cookies.getAll({
    domain: currentHost
  });

  console.log('🔍 All cookies:', allCookies.map(c => c.name));

  // Look for any cookie that might be a session
  const possibleSessionCookie = allCookies.find(c =>
    c.name === 'sid' ||
    c.name === 'sessionid' ||
    c.name.toLowerCase().includes('session')
  );

  if (possibleSessionCookie) {
    console.log('⚠️ Found possible session cookie:', possibleSessionCookie.name);
    return {
      domain: salesforceDomain,
      sessionId: possibleSessionCookie.value,
      uiDomain: currentOrigin
    };
  }

  throw new Error('Session cookie not found. Please log out of Salesforce and log back in.');
}

/**
 * Make API call with session ID
 */
async function makeAPICall(url, sessionId, method = 'GET', body = null) {
  console.log(`🌐 Making ${method} request to:`, url);

  const options = {
    method: method,
    headers: {
      'Authorization': `Bearer ${sessionId}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const jsonBody = await response.json();
      if (Array.isArray(jsonBody) && jsonBody.length > 0) {
        errorMsg = jsonBody[0].message;
      } else {
        errorMsg = JSON.stringify(jsonBody);
      }
    } catch (e) {
      errorMsg = `Status ${response.status}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

console.log('🚀 SlipStream Background Service Worker loaded');
