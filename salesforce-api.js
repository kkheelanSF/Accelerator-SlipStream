/**
 * Salesforce SlipStream - API Client
 * Handles REST API and Tooling API calls to Salesforce
 */

class SalesforceAPI {
  constructor() {
    this.sessionId = null;
    this.instanceUrl = null;
    this.apiVersion = 'v60.0';
    this.initialized = false;
    this.initPromise = null;
    // Note: init() must be called explicitly and awaited
  }

  /**
   * Initialize API client by extracting session info
   * Now uses background worker for reliable session extraction
   * MUST be called explicitly and awaited before making API calls!
   */
  async init() {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🔄 Requesting auth info from background worker...');

      // Request auth info from background worker (uses chrome.cookies API)
      const response = await chrome.runtime.sendMessage({
        type: 'GET_AUTH_INFO'
      });

      if (response && response.success) {
        this.sessionId = response.data.sessionId;
        this.instanceUrl = response.data.domain;
        this.initialized = true;
        console.log('✅ SalesforceAPI initialized via background worker');
        console.log('🔧 Session ID:', this.sessionId ? 'Found' : 'Not found');
        console.log('🔧 API Domain:', this.instanceUrl);
      } else {
        throw new Error(response?.error || 'Failed to get auth info from background');
      }
    } catch (error) {
      console.error('❌ Failed to initialize via background worker:', error);
      console.log('⚠️ Falling back to local extraction...');

      // Fallback to old method
      this.sessionId = this.extractSessionId();
      this.instanceUrl = window.location.origin;
      this.initialized = true;

      if (this.sessionId) {
        console.log('✅ SalesforceAPI initialized with local session ID');
      } else {
        console.log('⚠️ SalesforceAPI initialized without session ID');
      }

      console.log('🔧 Instance URL:', this.instanceUrl);
    }
  }

  /**
   * Extract Salesforce session ID from page
   */
  extractSessionId() {
    console.log('🔍 Attempting to extract Salesforce session ID...');

    // Method 1: Try to get from Visualforce/Classic global variables
    try {
      if (typeof window !== 'undefined') {
        // Check __sfdcSessionId (most reliable)
        if (window.__sfdcSessionId) {
          console.log('✅ Found session via __sfdcSessionId');
          return window.__sfdcSessionId;
        }

        // Check $Api.Session_Id
        if (window.$Api && window.$Api.Session_Id) {
          console.log('✅ Found session via $Api.Session_Id');
          return window.$Api.Session_Id;
        }

        // Check SfdcApp (Lightning)
        if (window.SfdcApp && window.SfdcApp.sessionId) {
          console.log('✅ Found session via SfdcApp.sessionId');
          return window.SfdcApp.sessionId;
        }
      }
    } catch (e) {
      console.warn('Error checking global variables:', e);
    }

    // Method 2: Extract from DOM meta tags
    try {
      const metaTags = document.querySelectorAll('meta');
      for (const meta of metaTags) {
        if (meta.getAttribute('name') === 'salesforce-session-id' ||
            meta.getAttribute('name') === 'sessionid') {
          const sessionId = meta.getAttribute('content');
          if (sessionId) {
            console.log('✅ Found session via meta tag');
            return sessionId;
          }
        }
      }
    } catch (e) {
      console.warn('Error checking meta tags:', e);
    }

    // Method 3: Extract from inline scripts
    try {
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent || script.innerText;

        // Look for session ID patterns in script content
        const sessionPatterns = [
          /__sfdcSessionId\s*=\s*['"]([^'"]+)['"]/,
          /sessionId\s*:\s*['"]([^'"]+)['"]/,
          /"sessionId"\s*:\s*"([^"]+)"/,
          /sid=([a-zA-Z0-9!._-]{15,})/
        ];

        for (const pattern of sessionPatterns) {
          const match = content.match(pattern);
          if (match && match[1]) {
            console.log('✅ Found session via script pattern');
            return match[1];
          }
        }
      }
    } catch (e) {
      console.warn('Error parsing scripts:', e);
    }

    // Method 4: Extract from cookies
    try {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'sid' || name === 'salesforce_sid') {
          if (value && value.length > 15) {
            console.log('✅ Found session via cookie');
            return value;
          }
        }
      }
    } catch (e) {
      console.warn('Error checking cookies:', e);
    }

    // Method 5: Try session storage
    try {
      const sessionFromStorage = sessionStorage.getItem('salesforce_session_id');
      if (sessionFromStorage) {
        console.log('✅ Found session via sessionStorage');
        return sessionFromStorage;
      }
    } catch (e) {
      console.warn('Error checking sessionStorage:', e);
    }

    // Method 6: Try to extract from URL (some Salesforce pages)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sid = urlParams.get('sid') || urlParams.get('sessionId');
      if (sid) {
        console.log('✅ Found session via URL parameter');
        return sid;
      }
    } catch (e) {
      console.warn('Error checking URL:', e);
    }

    // Method 7: Try accessing from window.opener (if in popup)
    try {
      if (window.opener && window.opener.__sfdcSessionId) {
        console.log('✅ Found session via window.opener');
        return window.opener.__sfdcSessionId;
      }
    } catch (e) {
      // Cross-origin, ignore
    }

    console.warn('⚠️ Could not extract Salesforce session ID after trying all methods');
    console.log('💡 This is normal if your org has "Hide session ID in URLs and logs" enabled');
    console.log('✅ SlipStream will use cookie-based authentication instead');
    console.log('📝 Tip: For best results, open SlipStream from Home or a record page (not Setup)');
    return null;
  }

  /**
   * Make REST API call
   * Routes through background worker to avoid CORS issues
   */
  async callAPI(endpoint, method = 'GET', body = null) {
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}${endpoint}`;

    console.log(`🌐 API Call via background: ${method} ${url}`);

    try {
      // Route through background worker
      const response = await chrome.runtime.sendMessage({
        type: 'MAKE_API_CALL',
        url: url,
        sessionId: this.sessionId,
        method: method,
        body: body
      });

      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.error || 'API call failed');
      }
    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }
  }

  /**
   * Execute SOQL query
   */
  async query(soql) {
    console.log(`🔍 Executing SOQL query: ${soql}`);
    const encodedQuery = encodeURIComponent(soql);
    return await this.callAPI(`/query/?q=${encodedQuery}`);
  }

  /**
   * Make Tooling API call
   * Routes through background worker to avoid CORS issues
   */
  async callToolingAPI(endpoint, method = 'GET', body = null) {
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/tooling${endpoint}`;

    console.log(`🔧 Tooling API Call via background: ${method} ${url}`);

    try {
      // Route through background worker
      const response = await chrome.runtime.sendMessage({
        type: 'MAKE_API_CALL',
        url: url,
        sessionId: this.sessionId,
        method: method,
        body: body
      });

      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.error || 'Tooling API call failed');
      }
    } catch (error) {
      console.error('❌ Tooling API call failed:', error);
      throw error;
    }
  }

  /**
   * Get all SObjects in the org
   */
  async getAllSObjects() {
    console.log('📋 Fetching all SObjects...');
    try {
      const data = await this.callAPI('/sobjects/');

      // Filter to relevant objects (exclude system/internal objects)
      const objects = data.sobjects.filter(obj => {
        // Include if:
        // - Custom object (ends with __c)
        // - Standard object that's commonly used
        // - Has layouts (layoutable)
        return obj.layoutable &&
               (obj.custom || this.isCommonStandardObject(obj.name));
      });

      console.log(`✅ Found ${objects.length} SObjects`);
      return objects.map(obj => ({
        name: obj.name,
        label: obj.label,
        labelPlural: obj.labelPlural,
        custom: obj.custom,
        queryable: obj.queryable,
        searchable: obj.searchable,
        layoutable: obj.layoutable
      }));
    } catch (error) {
      console.error('❌ Failed to fetch SObjects:', error);
      return [];
    }
  }

  /**
   * Check if object is a commonly used standard object
   */
  isCommonStandardObject(name) {
    const commonObjects = [
      'Account', 'Contact', 'Lead', 'Opportunity', 'Case',
      'Task', 'Event', 'Campaign', 'User', 'Product2',
      'Pricebook2', 'Quote', 'Order', 'Contract', 'Asset',
      'Solution', 'Idea', 'Report', 'Dashboard'
    ];
    return commonObjects.includes(name);
  }

  /**
   * Get object metadata including all fields
   */
  async getObjectMetadata(objectName) {
    console.log(`📋 Fetching metadata for ${objectName}...`);
    try {
      const data = await this.callAPI(`/sobjects/${objectName}/describe/`);

      return {
        name: data.name,
        label: data.label,
        labelPlural: data.labelPlural,
        fields: data.fields.map(field => ({
          name: field.name,
          label: field.label,
          type: field.type,
          custom: field.custom,
          calculated: field.calculated,
          updateable: field.updateable
        })),
        recordTypeInfos: data.recordTypeInfos || [],
        childRelationships: data.childRelationships || []
      };
    } catch (error) {
      console.error(`❌ Failed to fetch metadata for ${objectName}:`, error);
      return null;
    }
  }

  /**
   * Query field ID using Tooling API
   */
  async getFieldId(objectName, fieldApiName) {
    console.log(`🔍 Querying field ID for ${objectName}.${fieldApiName}...`);

    try {
      // FIRST: Get the EntityDefinitionId
      let entityDefinitionId;

      // For custom objects (ends with __c), query CustomObject instead of EntityDefinition
      if (objectName.endsWith('__c')) {
        // Remove namespace prefix (e.g., SBQQ__Quote__c → Quote)
        const developerName = objectName.replace(/__c$/, '').replace(/^.*__/, '');
        const customObjSoql = `SELECT Id FROM CustomObject WHERE DeveloperName = '${developerName}'`;
        console.log(`📝 SOQL Query (CustomObject):\n${customObjSoql}`);

        const customObjQuery = encodeURIComponent(customObjSoql);
        const customObjData = await this.callToolingAPI(`/query/?q=${customObjQuery}`);

        console.log(`📊 CustomObject result: ${customObjData.records ? customObjData.records.length : 0} record(s) found`);
        console.log(`📋 Full CustomObject response:`, JSON.stringify(customObjData, null, 2));

        if (!customObjData.records || customObjData.records.length === 0) {
          console.warn(`⚠️ CustomObject not found for ${objectName}`);
          return null;
        }

        const fullCustomObjId = customObjData.records[0].Id;
        entityDefinitionId = fullCustomObjId.substring(0, 15); // Truncate to 15 chars
        console.log(`✅ Found CustomObject ID: ${fullCustomObjId} → ${entityDefinitionId}`);
      } else {
        // For standard objects, use EntityDefinition
        const entitySoql = `SELECT Id FROM EntityDefinition WHERE QualifiedApiName = '${objectName}'`;
        console.log(`📝 SOQL Query (EntityDefinition):\n${entitySoql}`);

        const entityQuery = encodeURIComponent(entitySoql);
        const entityData = await this.callToolingAPI(`/query/?q=${entityQuery}`);

        console.log(`📊 EntityDefinition result: ${entityData.records ? entityData.records.length : 0} record(s) found`);
        console.log(`📋 Full EntityDefinition response:`, JSON.stringify(entityData, null, 2));

        if (!entityData.records || entityData.records.length === 0) {
          console.warn(`⚠️ EntityDefinition not found for ${objectName}`);
          return null;
        }

        entityDefinitionId = entityData.records[0].Id;
        console.log(`✅ Found EntityDefinitionId: ${entityDefinitionId}`);
      }

      // For custom fields, query CustomField with the EntityDefinitionId (as ID, not API name!)
      if (fieldApiName.endsWith('__c')) {
        // Remove namespace prefix (e.g., SBQQ__Field__c → Field) and __c suffix
        const developerName = fieldApiName.replace(/__c$/, '').replace(/^.*__/, '');
        const soql = `SELECT Id, DeveloperName FROM CustomField WHERE DeveloperName = '${developerName}' AND EntityDefinitionId = '${entityDefinitionId}'`;
        console.log(`📝 SOQL Query (CustomField):\n${soql}`);

        const encodedQuery = encodeURIComponent(soql);
        const data = await this.callToolingAPI(`/query/?q=${encodedQuery}`);

        console.log(`📊 Query result: ${data.records ? data.records.length : 0} record(s) found`);
        if (data.records && data.records.length > 0) {
          console.log(`📋 Records:`, data.records);
        }

        if (data.records && data.records.length > 0) {
          // Get the 18-char ID and truncate to 15 chars for URL
          const fullId = data.records[0].Id;
          const shortId = fullId.substring(0, 15);
          console.log(`✅ Found custom field ID: ${fullId} → ${shortId}`);
          return shortId;
        }
      } else {
        // For standard fields, query FieldDefinition with DurableId
        const fieldDefSoql = `SELECT Id, QualifiedApiName, DurableId FROM FieldDefinition WHERE EntityDefinitionId = '${entityDefinitionId}' AND QualifiedApiName = '${objectName}.${fieldApiName}'`;
        console.log(`📝 SOQL Query (FieldDefinition):\n${fieldDefSoql}`);

        const fieldDefQuery = encodeURIComponent(fieldDefSoql);
        const fieldDefData = await this.callToolingAPI(`/query/?q=${fieldDefQuery}`);

        console.log(`📊 FieldDefinition result: ${fieldDefData.records ? fieldDefData.records.length : 0} record(s) found`);
        if (fieldDefData.records && fieldDefData.records.length > 0) {
          console.log(`📋 Records:`, fieldDefData.records);
        }

        if (fieldDefData.records && fieldDefData.records.length > 0) {
          const record = fieldDefData.records[0];

          // Extract the field ID from DurableId (format: "EntityId.FieldId")
          if (record.DurableId && record.DurableId.includes('.')) {
            const setupId = record.DurableId.split('.')[1];
            console.log(`✅ Found standard field setup ID: ${setupId}`);
            return setupId;
          }
        }
      }

      console.warn(`⚠️ Field ID not found for ${objectName}.${fieldApiName}`);
      return null;
    } catch (error) {
      console.error(`❌ Failed to query field ID:`, error);
      return null;
    }
  }

  /**
   * Get all page layouts for an object
   */
  async getPageLayouts(objectName) {
    console.log(`📋 Fetching page layouts for ${objectName}...`);

    try {
      const soql = `SELECT Id, Name, TableEnumOrId FROM Layout WHERE TableEnumOrId IN (SELECT Id FROM EntityDefinition WHERE QualifiedApiName = '${objectName}')`;
      const encodedQuery = encodeURIComponent(soql);
      const data = await this.callToolingAPI(`/query/?q=${encodedQuery}`);

      if (data.records && data.records.length > 0) {
        console.log(`✅ Found ${data.records.length} page layouts`);
        return data.records.map(layout => ({
          id: layout.Id,
          name: layout.Name
        }));
      }

      return [];
    } catch (error) {
      console.error(`❌ Failed to fetch page layouts:`, error);
      return [];
    }
  }

  /**
   * Get validation rules for an object
   */
  async getValidationRules(objectName) {
    console.log(`📋 Fetching validation rules for ${objectName}...`);

    try {
      const soql = `SELECT Id, ValidationName, EntityDefinitionId FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = '${objectName}'`;
      const encodedQuery = encodeURIComponent(soql);
      const data = await this.callToolingAPI(`/query/?q=${encodedQuery}`);

      if (data.records && data.records.length > 0) {
        console.log(`✅ Found ${data.records.length} validation rules`);
        return data.records.map(rule => ({
          id: rule.Id,
          name: rule.ValidationName
        }));
      }

      return [];
    } catch (error) {
      console.error(`❌ Failed to fetch validation rules:`, error);
      return [];
    }
  }

  /**
   * Get Apex triggers for an object
   */
  async getApexTriggers(objectName) {
    console.log(`📋 Fetching Apex triggers for ${objectName}...`);

    try {
      const soql = `SELECT Id, Name, TableEnumOrId FROM ApexTrigger WHERE TableEnumOrId IN (SELECT Id FROM EntityDefinition WHERE QualifiedApiName = '${objectName}')`;
      const encodedQuery = encodeURIComponent(soql);
      const data = await this.callToolingAPI(`/query/?q=${encodedQuery}`);

      if (data.records && data.records.length > 0) {
        console.log(`✅ Found ${data.records.length} triggers`);
        return data.records.map(trigger => ({
          id: trigger.Id,
          name: trigger.Name
        }));
      }

      return [];
    } catch (error) {
      console.error(`❌ Failed to fetch triggers:`, error);
      return [];
    }
  }

  /**
   * Get Lightning pages (FlexiPages) for an object
   */
  async getFlexiPages(objectName) {
    console.log(`📋 Fetching Lightning pages for ${objectName}...`);

    try {
      // FlexiPages are associated with objects via EntityDefinition
      const soql = `SELECT Id, DeveloperName, MasterLabel, Type FROM FlexiPage WHERE Type = 'RecordPage' AND EntityDefinition.QualifiedApiName = '${objectName}'`;
      const encodedQuery = encodeURIComponent(soql);
      const data = await this.callToolingAPI(`/query/?q=${encodedQuery}`);

      if (data.records && data.records.length > 0) {
        console.log(`✅ Found ${data.records.length} Lightning pages`);
        return data.records.map(page => ({
          id: page.Id,
          name: page.DeveloperName,
          label: page.MasterLabel
        }));
      }

      return [];
    } catch (error) {
      console.error(`❌ Failed to fetch Lightning pages:`, error);
      return [];
    }
  }
}

// Export for use in other scripts
window.SalesforceAPI = SalesforceAPI;
