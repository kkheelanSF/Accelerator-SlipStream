/**
 * Salesforce SlipStream - URL Builder
 * Generates Salesforce URLs for navigation
 */

class URLBuilder {
  constructor() {
    this.baseUrl = this.detectBaseUrl();
    console.log('🔧 URLBuilder initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Detect the current Salesforce instance URL
   */
  detectBaseUrl() {
    const hostname = window.location.hostname;
    const origin = window.location.origin;

    // Preserve the exact format of the current URL
    // Examples:
    // - company.lightning.force.com → use as-is
    // - company.sandbox.my.salesforce.com → use as-is
    // - company.my.salesforce.com → use as-is
    // - company.sandbox.my.salesforce-setup.com → use as-is

    // For Lightning URLs, just use the current origin
    if (hostname.includes('.lightning.') ||
        hostname.includes('.my.salesforce') ||
        hostname.includes('.salesforce-setup.com')) {
      return origin;
    }

    // For Classic URLs, try to convert to Lightning
    if (hostname.includes('.salesforce.com')) {
      // Classic format: company.salesforce.com
      const parts = hostname.split('.');
      const instance = parts[0];

      // Check if it's a sandbox by looking at URL patterns
      if (window.location.href.includes('--')) {
        // Enhanced domain format (e.g., company--sandbox.my.salesforce.com)
        return origin;
      }

      return `https://${instance}.lightning.force.com`;
    }

    // Fallback: use current origin
    return origin;
  }

  /**
   * Build URL for command handler
   */
  build(handlerName, params = {}) {
    const handler = this[handlerName];

    if (!handler) {
      console.error(`Unknown handler: ${handlerName}`);
      return null;
    }

    return handler.call(this, params);
  }

  /**
   * Get the correct base URL for Setup pages
   * Sandboxes may need salesforce-setup.com domain
   */
  getSetupBaseUrl() {
    const hostname = window.location.hostname;

    // If we're already on a salesforce-setup.com domain, use current origin
    if (hostname.includes('.salesforce-setup.com')) {
      return window.location.origin;
    }

    // If on a sandbox (my.salesforce.com with sandbox in the name)
    if (hostname.includes('.sandbox.my.salesforce.com')) {
      // Convert to salesforce-setup.com
      return window.location.origin.replace('.my.salesforce.com', '.my.salesforce-setup.com');
    }

    // For other cases, use the base URL as-is
    return this.baseUrl;
  }

  /**
   * Setup Home
   */
  openSetup() {
    const setupBaseUrl = this.getSetupBaseUrl();
    console.log('🔗 Navigating to Setup with URL:', setupBaseUrl);
    return `${setupBaseUrl}/lightning/setup/SetupOneHome/home`;
  }

  /**
   * Setup Quick Find
   * Opens Setup and uses query parameter for Quick Find search
   */
  openSetupQuickFind(params) {
    const { searchTerm } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    // Use the setupSearch query parameter to pre-populate Quick Find
    return `${setupBaseUrl}/lightning/setup/SetupOneHome/home?setupSearch=${encodeURIComponent(searchTerm)}`;
  }

  /**
   * Object Manager
   */
  openObjectManager() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ObjectManager/home`;
  }

  /**
   * Setup Object (generic object page)
   */
  openSetupObject(params) {
    const { objectName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/Details/view`;
  }

  /**
   * Setup Object Fields
   */
  openSetupObjectFields(params) {
    const { objectName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/FieldsAndRelationships/view`;
  }

  /**
   * Setup Object Field (specific field) - Legacy, opens list
   */
  openSetupObjectField(params) {
    const { objectName, fieldName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    // Opens fields list page
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/FieldsAndRelationships/view`;
  }

  /**
   * Setup Object Field Direct (with field ID lookup)
   */
  async openSetupObjectFieldDirect(params) {
    const { objectName, fieldApiName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();

    // Get metadata cache
    const metadataCache = new MetadataCache();
    await metadataCache.init();

    // Query field ID
    const fieldId = await metadataCache.getFieldId(objectName, fieldApiName);

    if (fieldId) {
      // Direct navigation to field page
      console.log(`✅ Found field ID: ${fieldId}, navigating directly`);
      return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/FieldsAndRelationships/${fieldId}/view`;
    } else {
      // Fallback to fields list
      console.warn(`⚠️ Field ID not found, falling back to fields list`);
      return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/FieldsAndRelationships/view`;
    }
  }

  /**
   * Setup Object Layouts (list/home)
   */
  openSetupObjectLayouts(params) {
    const { objectName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/PageLayouts/view`;
  }

  /**
   * Setup Object Layout (specific Page Layout) - Legacy, opens list
   */
  openSetupObjectLayout(params) {
    const { objectName, layoutName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    // LIMITATION: Page layout URLs require the layout ID (e.g., 00hxx000000xxxx) which we don't have
    // Direct URL format would be: /lightning/setup/ObjectManager/${objectName}/PageLayouts/${layoutId}/view
    // Since we only have the layout name, we navigate to the layouts list
    // TODO: In future, could implement layout search/filtering via query parameter if Salesforce supports it
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/PageLayouts/view`;
  }

  /**
   * Setup Object Layout Direct (with layout ID lookup)
   */
  async openSetupObjectLayoutDirect(params) {
    const { objectName, layoutName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();

    // Get metadata cache
    const metadataCache = new MetadataCache();
    await metadataCache.init();

    // Query all layouts for the object
    const layouts = await metadataCache.getPageLayouts(objectName);

    if (layouts && layouts.length > 0) {
      // Find layout by name (case-insensitive, partial match)
      const layout = layouts.find(l =>
        l.name.toLowerCase().includes(layoutName.toLowerCase()) ||
        layoutName.toLowerCase().includes(l.name.toLowerCase())
      );

      if (layout && layout.id) {
        // Direct navigation to layout editor
        console.log(`✅ Found layout ID: ${layout.id}, navigating directly`);
        return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/PageLayouts/${layout.id}/view`;
      } else {
        console.warn(`⚠️ Layout not found, falling back to layouts list`);
      }
    } else {
      console.warn(`⚠️ No layouts found, falling back to layouts list`);
    }

    // Fallback to layouts list
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/PageLayouts/view`;
  }

  /**
   * Setup Object FlexiPages (list/home)
   */
  openSetupObjectFlexiPages(params) {
    const { objectName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    // Navigate to Lightning Pages list for the specific object
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/LightningPages/view`;
  }

  /**
   * Setup Object FlexiPage (specific Lightning Page) - Legacy, opens list
   */
  openSetupObjectFlexiPage(params) {
    const { objectName, flexiPageName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    // Navigate to Lightning Pages list for the object
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/LightningPages/view`;
  }

  /**
   * Setup Object FlexiPage Direct (with FlexiPage ID lookup)
   */
  async openSetupObjectFlexiPageDirect(params) {
    const { objectName, flexiPageName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();

    // Get metadata cache
    const metadataCache = new MetadataCache();
    await metadataCache.init();

    // Query all FlexiPages for the object
    const flexiPages = await metadataCache.getFlexiPages(objectName);

    if (flexiPages && flexiPages.length > 0) {
      // Find FlexiPage by name (case-insensitive, partial match)
      const page = flexiPages.find(p =>
        (p.name && p.name.toLowerCase().includes(flexiPageName.toLowerCase())) ||
        (p.label && p.label.toLowerCase().includes(flexiPageName.toLowerCase())) ||
        flexiPageName.toLowerCase().includes((p.name || '').toLowerCase()) ||
        flexiPageName.toLowerCase().includes((p.label || '').toLowerCase())
      );

      if (page && page.id) {
        // Truncate ID to 15 characters for URL
        const shortId = page.id.substring(0, 15);
        console.log(`✅ Found FlexiPage ID: ${page.id} → ${shortId}, navigating directly`);
        return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/LightningPages/${shortId}/view`;
      } else {
        console.warn(`⚠️ FlexiPage not found, falling back to list`);
      }
    } else {
      console.warn(`⚠️ No FlexiPages found, falling back to list`);
    }

    // Fallback to FlexiPages list
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/LightningPages/view`;
  }

  /**
   * Setup Object Validation Rules
   */
  openSetupObjectValidationRules(params) {
    const { objectName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/ValidationRules/view`;
  }

  /**
   * Setup Object Compact Layouts
   */
  openSetupObjectCompactLayouts(params) {
    const { objectName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/CompactLayouts/view`;
  }

  /**
   * Setup Object Record Types
   */
  openSetupObjectRecordTypes(params) {
    const { objectName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/RecordTypes/view`;
  }

  /**
   * Setup Object Triggers
   */
  openSetupObjectTriggers(params) {
    const { objectName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/ApexTriggers/view`;
  }

  /**
   * Setup Object Buttons
   */
  openSetupObjectButtons(params) {
    const { objectName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ObjectManager/${objectName}/ButtonsLinksActions/view`;
  }

  /**
   * Developer Console
   */
  openDevConsole() {
    // Developer Console uses a special URL pattern
    // Get the current Salesforce instance for Classic URL
    const classicUrl = this.getClassicUrl();
    return `${classicUrl}/_ui/common/apex/debug/ApexCSIPage`;
  }

  /**
   * Debug Logs
   */
  openDebugLogs() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexDebugLogs/home`;
  }

  /**
   * Debug Log (specific log by ID)
   */
  openDebugLog(params) {
    const { logId } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    // Encode the classic URL path as the address parameter
    const classicPath = `/p/setup/layout/ApexDebugLogDetailEdit/d?apex_log_id=${logId}`;
    const encodedPath = encodeURIComponent(classicPath);
    return `${setupBaseUrl}/lightning/setup/ApexDebugLogDetail/page?address=${encodedPath}`;
  }

  /**
   * System Log / System Overview
   */
  openSystemLog() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/SystemOverview/home`;
  }

  /**
   * Event Log / Event Monitoring
   */
  openEventLog() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/EventManager/home`;
  }

  /**
   * Email Logs
   */
  openEmailLogs() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/EmailLogFiles/home`;
  }

  /**
   * Scheduled Jobs
   */
  openScheduledJobs() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ScheduledJobs/home`;
  }

  /**
   * Users (All Users list)
   */
  openUsers() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ManageUsers/home`;
  }

  /**
   * User by Username or ID
   */
  openUser(params) {
    const { userIdentifier } = params;
    const setupBaseUrl = this.getSetupBaseUrl();

    // If it's a 15 or 18 character ID starting with 005, use direct ID navigation
    if (userIdentifier.match(/^005[a-zA-Z0-9]{12,15}$/)) {
      return `${setupBaseUrl}/lightning/setup/ManageUsers/${userIdentifier}/view`;
    }

    // Otherwise, it's a username/email - navigate to users list with search
    return `${setupBaseUrl}/lightning/setup/ManageUsers/home?search=${encodeURIComponent(userIdentifier)}`;
  }

  /**
   * Active Users
   */
  openActiveUsers() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ManageUsers/home?filterScope=Active`;
  }

  /**
   * Frozen Users
   */
  openFrozenUsers() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ManageUsers/home?filterScope=Frozen`;
  }

  /**
   * Profiles (All Profiles list)
   */
  openProfiles() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/Profiles/home`;
  }

  /**
   * Profile by Name
   */
  openProfile(params) {
    const { profileName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    // Navigate to profiles list with search
    return `${setupBaseUrl}/lightning/setup/Profiles/home?search=${encodeURIComponent(profileName)}`;
  }

  /**
   * Permission Sets
   */
  openPermissionSets() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/PermSets/home`;
  }

  /**
   * Permission Set by Name
   */
  openPermissionSet(params) {
    const { permissionSetName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    // Navigate to permission sets list with search
    return `${setupBaseUrl}/lightning/setup/PermSets/home?search=${encodeURIComponent(permissionSetName)}`;
  }

  /**
   * Permission Set Groups
   */
  openPermissionSetGroups() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/PermSetGroups/home`;
  }

  /**
   * Permission Set Group by Name
   */
  openPermissionSetGroup(params) {
    const { groupName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    // Navigate to permission set groups list with search
    return `${setupBaseUrl}/lightning/setup/PermSetGroups/home?search=${encodeURIComponent(groupName)}`;
  }

  /**
   * Apex Classes
   */
  openApexClasses() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexClasses/home`;
  }

  /**
   * Apex Class by Name
   */
  openApexClass(params) {
    const { className } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexClasses/home?search=${encodeURIComponent(className)}`;
  }

  /**
   * Apex Triggers
   */
  openApexTriggers() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexTriggers/home`;
  }

  /**
   * Apex Trigger by Name
   */
  openApexTrigger(params) {
    const { triggerName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexTriggers/home?search=${encodeURIComponent(triggerName)}`;
  }

  /**
   * Apex Test Execution
   */
  openApexTestExecution() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexTestQueue/home`;
  }

  /**
   * Apex Jobs
   */
  openApexJobs() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexJobs/home`;
  }

  /**
   * Anonymous Apex (Execute Anonymous Window)
   */
  openAnonymousApex() {
    const classicUrl = this.getClassicUrl();
    return `${classicUrl}/setup/apex/ApexExecuteAnonymous.apexp`;
  }

  /**
   * Visualforce Pages
   */
  openVisualforcePages() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexPages/home`;
  }

  /**
   * Visualforce Page by Name
   */
  openVisuaforcePage(params) {
    const { pageName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexPages/home?search=${encodeURIComponent(pageName)}`;
  }

  /**
   * Visualforce Components
   */
  openVisualforceComponents() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexComponents/home`;
  }

  /**
   * Visualforce Component by Name
   */
  openVisualforceComponent(params) {
    const { componentName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/ApexComponents/home?search=${encodeURIComponent(componentName)}`;
  }

  /**
   * Lightning Components
   */
  openLightningComponents() {
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/LightningComponentBundles/home`;
  }

  /**
   * Lightning Component by Name
   */
  openLightningComponent(params) {
    const { componentName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/LightningComponentBundles/home?search=${encodeURIComponent(componentName)}`;
  }

  /**
   * Aura Bundle by Name
   */
  openAuraBundle(params) {
    const { bundleName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/LightningComponentBundles/home?search=${encodeURIComponent(bundleName)}`;
  }

  /**
   * LWC (Lightning Web Component) by Name
   */
  openLWC(params) {
    const { componentName } = params;
    const setupBaseUrl = this.getSetupBaseUrl();
    return `${setupBaseUrl}/lightning/setup/LightningComponentBundles/home?search=${encodeURIComponent(componentName)}`;
  }

  /**
   * Get Classic Salesforce URL from Lightning URL
   */
  getClassicUrl() {
    const hostname = window.location.hostname;

    // Convert Lightning URL to Classic URL
    if (hostname.includes('.lightning.force.com')) {
      const instance = hostname.split('.')[0];

      // Check if it's a sandbox by checking if instance contains '--'
      // Example: company--sandbox.lightning.force.com
      if (instance.includes('--')) {
        // Convert to my.salesforce.com format for sandbox
        // company--sandbox -> company.sandbox.my.salesforce.com
        const parts = instance.split('--');
        const org = parts[0];
        const sandboxName = parts.slice(1).join('.');
        return `https://${org}.${sandboxName}.my.salesforce.com`;
      }

      // Production org
      return `https://${instance}.salesforce.com`;
    }

    if (hostname.includes('.my.salesforce.com')) {
      return window.location.origin;
    }

    // Already Classic or unknown format
    return window.location.origin;
  }

  /**
   * Navigate to URL
   * @param {string} url - Target URL
   * @param {boolean} newTab - Open in new tab (default: true for Dev Console, false for others)
   */
  navigate(url, newTab = false) {
    if (!url) {
      console.error('❌ Invalid URL - cannot navigate');
      return false;
    }

    console.log(`🔗 Navigating to: ${url}`);
    console.log(`📍 Open in new tab: ${newTab}`);

    if (newTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }

    return true;
  }

  /**
   * Execute command by handler name
   * @param {string} handlerName - Command handler name
   * @param {object} params - Command parameters
   * @param {boolean} openInNewTab - Whether to open in new tab (true) or same page (false)
   */
  async executeCommand(handlerName, params = {}, openInNewTab = false) {
    console.log(`⚡ Executing command: ${handlerName}`, params);
    console.log(`📑 Open in new tab: ${openInNewTab}`);

    const handler = this[handlerName];

    if (!handler) {
      console.error(`❌ Unknown handler: ${handlerName}`);
      return false;
    }

    // Call handler (may be async)
    let url = handler.call(this, params);

    // If handler returns a promise, await it
    if (url instanceof Promise) {
      url = await url;
    }

    if (!url) {
      console.error(`❌ Failed to build URL for handler: ${handlerName}`);
      return false;
    }

    // Dev Console always opens in new tab
    if (handlerName === 'openDevConsole') {
      openInNewTab = true;
    }

    return this.navigate(url, openInNewTab);
  }
}

// Export for use in content.js
window.URLBuilder = URLBuilder;
