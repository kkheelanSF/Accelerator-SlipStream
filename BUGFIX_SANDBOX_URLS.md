# 🐛 Bug Fix: Sandbox URL Format

## Issue Found

When testing in a **sandbox environment**, the Setup navigation URLs were incorrect.

### ❌ Incorrect URL (What we had)
```
https://{domain}.lightning.force.com/lightning/setup/SetupOneHome/home
```

### ✅ Correct URL (What we need)
```
https://{domain}.sandbox.my.salesforce-setup.com/lightning/setup/SetupOneHome/home
```

---

## Root Cause

The `URLBuilder.detectBaseUrl()` method was converting all URLs to the `.lightning.force.com` format, which works for **production orgs** but not for **sandboxes**.

### Salesforce URL Formats

Salesforce uses different domain patterns depending on org type:

#### Production Orgs
```
https://company.lightning.force.com
https://company.my.salesforce.com
```

#### Sandbox Orgs
```
https://company--sandbox.sandbox.my.salesforce.com
https://company--sandbox.sandbox.my.salesforce-setup.com
```

#### Enhanced Domains (MyDomain)
```
https://mydomain.lightning.force.com
https://mydomain--sandbox.sandbox.my.salesforce.com
```

---

## Solution Implemented

### 1. Updated `detectBaseUrl()` Method

**Before:**
```javascript
detectBaseUrl() {
  const hostname = window.location.hostname;

  if (hostname.includes('.lightning.force.com')) {
    const instance = hostname.split('.')[0];
    return `https://${instance}.lightning.force.com`;
  }

  // ... converting everything to .lightning.force.com
}
```

**After:**
```javascript
detectBaseUrl() {
  const hostname = window.location.hostname;
  const origin = window.location.origin;

  // Preserve the exact format of the current URL
  if (hostname.includes('.lightning.') ||
      hostname.includes('.my.salesforce') ||
      hostname.includes('.salesforce-setup.com')) {
    return origin;  // Use current origin as-is
  }

  // ... handle other cases
}
```

**Key Change:** Now we **preserve the current origin** instead of converting to a different format.

---

### 2. Added `getSetupBaseUrl()` Helper

For Setup pages specifically, sandboxes need the `.salesforce-setup.com` domain:

```javascript
getSetupBaseUrl() {
  const hostname = window.location.hostname;

  // If we're already on salesforce-setup.com, use it
  if (hostname.includes('.salesforce-setup.com')) {
    return window.location.origin;
  }

  // If on sandbox, convert to salesforce-setup.com
  if (hostname.includes('.sandbox.my.salesforce.com')) {
    return window.location.origin.replace(
      '.my.salesforce.com',
      '.my.salesforce-setup.com'
    );
  }

  // For production, use base URL
  return this.baseUrl;
}
```

**Key Feature:** Automatically converts `.my.salesforce.com` → `.my.salesforce-setup.com` for sandboxes.

---

### 3. Updated All Setup Methods

All Setup navigation methods now use `getSetupBaseUrl()`:

```javascript
openSetup() {
  const setupBaseUrl = this.getSetupBaseUrl();
  return `${setupBaseUrl}/lightning/setup/SetupOneHome/home`;
}

openObjectManager() {
  const setupBaseUrl = this.getSetupBaseUrl();
  return `${setupBaseUrl}/lightning/setup/ObjectManager/home`;
}

openSetupObject(params) {
  const { objectName } = params;
  const setupBaseUrl = this.getSetupBaseUrl();
  return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/Details/view`;
}

// ... all other Setup methods updated similarly
```

---

### 4. Added Debug Logging

To help troubleshoot URL issues:

```javascript
constructor() {
  this.baseUrl = this.detectBaseUrl();
  console.log('🔧 URLBuilder initialized with baseUrl:', this.baseUrl);
}

executeCommand(handlerName, params = {}, openInNewTab = false) {
  console.log(`⚡ Executing command: ${handlerName}`, params);
  // ...
}

navigate(url, newTab = false) {
  console.log(`🔗 Navigating to: ${url}`);
  console.log(`📍 Open in new tab: ${newTab}`);
  // ...
}
```

---

## Testing the Fix

### In Production Org
```
Current URL: https://mycompany.lightning.force.com/lightning/...
Command:     open setup
Navigate to: https://mycompany.lightning.force.com/lightning/setup/SetupOneHome/home
Result:      ✅ Works
```

### In Sandbox Org
```
Current URL: https://mycompany--dev.sandbox.my.salesforce.com/lightning/...
Command:     open setup
Navigate to: https://mycompany--dev.sandbox.my.salesforce-setup.com/lightning/setup/SetupOneHome/home
Result:      ✅ Works
```

### With Enhanced Domain (Production)
```
Current URL: https://mydomain.lightning.force.com/lightning/...
Command:     open setup
Navigate to: https://mydomain.lightning.force.com/lightning/setup/SetupOneHome/home
Result:      ✅ Works
```

### With Enhanced Domain (Sandbox)
```
Current URL: https://mydomain--sandbox.sandbox.my.salesforce.com/lightning/...
Command:     open setup
Navigate to: https://mydomain--sandbox.sandbox.my.salesforce-setup.com/lightning/setup/SetupOneHome/home
Result:      ✅ Works
```

---

## How to Verify the Fix

### 1. Check Console Logs
Open browser DevTools (F12) → Console tab

You should see:
```
🔧 URLBuilder initialized with baseUrl: https://yourorg.sandbox.my.salesforce.com
⚡ Executing command: openSetup {}
🔗 Navigating to: https://yourorg.sandbox.my.salesforce-setup.com/lightning/setup/SetupOneHome/home
📍 Open in new tab: false
```

### 2. Test Setup Navigation
```
1. Open SlipStream (F8)
2. Type: open setup
3. Press Enter
4. Check URL in address bar
5. Should be: https://yourorg.sandbox.my.salesforce-setup.com/lightning/setup/SetupOneHome/home
```

### 3. Test Object Manager
```
1. Open SlipStream (F8)
2. Type: open object manager
3. Press Enter
4. Check URL includes: /lightning/setup/ObjectManager/home
5. Domain should match your org type
```

---

## URL Format Reference

### Setup Pages - Production
```
Base: https://company.lightning.force.com
Path: /lightning/setup/SetupOneHome/home
Full: https://company.lightning.force.com/lightning/setup/SetupOneHome/home
```

### Setup Pages - Sandbox
```
Base: https://company--sandbox.sandbox.my.salesforce-setup.com
Path: /lightning/setup/SetupOneHome/home
Full: https://company--sandbox.sandbox.my.salesforce-setup.com/lightning/setup/SetupOneHome/home
```

### Object Manager - Production
```
Full: https://company.lightning.force.com/lightning/setup/ObjectManager/home
```

### Object Manager - Sandbox
```
Full: https://company--sandbox.sandbox.my.salesforce-setup.com/lightning/setup/ObjectManager/home
```

### Object Details - Production
```
Full: https://company.lightning.force.com/lightning/setup/ObjectManager/Account/Details/view
```

### Object Details - Sandbox
```
Full: https://company--sandbox.sandbox.my.salesforce-setup.com/lightning/setup/ObjectManager/Account/Details/view
```

---

## Files Modified

- ✏️ **`url-builder.js`**
  - Updated `detectBaseUrl()` - preserve origin instead of converting
  - Added `getSetupBaseUrl()` - handle sandbox Setup URL format
  - Updated all Setup methods to use `getSetupBaseUrl()`
  - Added debug logging for troubleshooting

---

## Impact

### ✅ What Now Works
- Setup navigation in sandboxes
- Setup navigation in production orgs
- Enhanced domain (MyDomain) support
- Automatic domain format detection
- Better error logging

### 🎯 Affected Commands
All Setup-related commands now work correctly in all org types:
- `open setup`
- `open setup home`
- `open object manager`
- `open setup {Object}`
- `open setup {Object} Fields`
- `open setup {Object} Field {Field}`
- `open setup {Object} Layout {Layout}`
- `open setup {Object} Flexi Page {FlexiPage}`
- `open setup {Object} Validation Rules`
- `open setup {Object} Compact Layouts`
- `open setup {Object} Record Types`

### ⚠️ Not Affected
Developer Console command uses Classic URL format (not Lightning), so it was already working correctly.

---

## Edge Cases Handled

### 1. Already on salesforce-setup.com
```
If already on: https://org.salesforce-setup.com/...
Use current origin as-is (don't convert)
```

### 2. Sandbox with salesforce.com
```
If on: https://org.sandbox.my.salesforce.com/...
Convert to: https://org.sandbox.my.salesforce-setup.com/...
```

### 3. Production with force.com
```
If on: https://org.lightning.force.com/...
Use as-is (no conversion needed)
```

### 4. Enhanced Domains
```
If on: https://mydomain--sandbox.sandbox.my.salesforce.com/...
Convert to: https://mydomain--sandbox.sandbox.my.salesforce-setup.com/...
```

---

## Future Enhancements

### Possible Improvements
1. Cache detected domain format to avoid re-detection
2. Add unit tests for URL generation
3. Support for Salesforce Communities URLs
4. Support for Experience Cloud sites

---

## Summary

✅ **Fixed:** Sandbox Setup URLs now use correct `.salesforce-setup.com` domain  
✅ **Preserved:** Production org URLs still work correctly  
✅ **Enhanced:** Better logging for troubleshooting  
✅ **Tested:** Works with production, sandbox, and enhanced domains  

---

<div align="center">

**🎉 Bug Fixed!**

*All Setup navigation commands now work correctly in sandboxes and production orgs.*

</div>
