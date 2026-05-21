/**
 * Salesforce SlipStream - URL Builder
 * Generates Salesforce URLs for navigation
 */

class URLBuilder {
  constructor() {
    this.baseUrl = this.detectBaseUrl();
  }

  /**
   * Detect the current Salesforce instance URL
   */
  detectBaseUrl() {
    const hostname = window.location.hostname;

    // Extract instance from various Salesforce URL formats
    // Examples:
    // - na1.lightning.force.com -> na1
    // - mycompany.lightning.force.com -> mycompany
    // - mycompany.my.salesforce.com -> mycompany

    if (hostname.includes('.lightning.force.com')) {
      const instance = hostname.split('.')[0];
      return `https://${instance}.lightning.force.com`;
    }

    if (hostname.includes('.my.salesforce.com')) {
      const instance = hostname.split('.')[0];
      return `https://${instance}.lightning.force.com`;
    }

    if (hostname.includes('.salesforce.com')) {
      // Extract instance from Classic URL
      const parts = hostname.split('.');
      const instance = parts[0];
      return `https://${instance}.lightning.force.com`;
    }

    // Fallback to current protocol + hostname
    return `${window.location.protocol}//${hostname}`;
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
   * Setup Home
   */
  openSetup() {
    return `${this.baseUrl}/lightning/setup/SetupOneHome/home`;
  }

  /**
   * Object Manager
   */
  openObjectManager() {
    return `${this.baseUrl}/lightning/setup/ObjectManager/home`;
  }

  /**
   * Setup Object (generic object page)
   */
  openSetupObject(params) {
    const { objectName } = params;
    return `${this.baseUrl}/lightning/setup/ObjectManager/${objectName}/Details/view`;
  }

  /**
   * Setup Object Fields
   */
  openSetupObjectFields(params) {
    const { objectName } = params;
    return `${this.baseUrl}/lightning/setup/ObjectManager/${objectName}/FieldsAndRelationships/view`;
  }

  /**
   * Setup Object Field (specific field)
   */
  openSetupObjectField(params) {
    const { objectName, fieldName } = params;
    // Field URLs typically need the field ID, but we can use the field name in Quick Find
    // This navigates to Fields page and we'll need to search for the field
    return `${this.baseUrl}/lightning/setup/ObjectManager/${objectName}/FieldsAndRelationships/view`;
  }

  /**
   * Setup Object Layout (Page Layout)
   */
  openSetupObjectLayout(params) {
    const { objectName, layoutName } = params;
    // Page layouts require the layout ID which we don't have
    // Navigate to page layouts list and user can select
    return `${this.baseUrl}/lightning/setup/ObjectManager/${objectName}/PageLayouts/view`;
  }

  /**
   * Setup Object Flexi Page (Lightning Page)
   */
  openSetupObjectFlexiPage(params) {
    const { objectName, flexiPageName } = params;
    // Lightning pages are accessed through Lightning App Builder
    // We'll navigate to the Lightning Pages list
    return `${this.baseUrl}/lightning/setup/FlexiPageList/home`;
  }

  /**
   * Setup Object Validation Rules
   */
  openSetupObjectValidationRules(params) {
    const { objectName } = params;
    return `${this.baseUrl}/lightning/setup/ObjectManager/${objectName}/ValidationRules/view`;
  }

  /**
   * Setup Object Compact Layouts
   */
  openSetupObjectCompactLayouts(params) {
    const { objectName } = params;
    return `${this.baseUrl}/lightning/setup/ObjectManager/${objectName}/CompactLayouts/view`;
  }

  /**
   * Setup Object Record Types
   */
  openSetupObjectRecordTypes(params) {
    const { objectName } = params;
    return `${this.baseUrl}/lightning/setup/ObjectManager/${objectName}/RecordTypes/view`;
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
   * Get Classic Salesforce URL from Lightning URL
   */
  getClassicUrl() {
    const hostname = window.location.hostname;

    // Convert Lightning URL to Classic URL
    if (hostname.includes('.lightning.force.com')) {
      const instance = hostname.split('.')[0];
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
      console.error('Invalid URL');
      return false;
    }

    if (newTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }

    return true;
  }

  /**
   * Execute command by handler name
   */
  executeCommand(handlerName, params = {}, openInNewTab = false) {
    const url = this.build(handlerName, params);

    if (!url) {
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
