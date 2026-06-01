/**
 * Salesforce SlipStream - Metadata Cache
 * Caches SObject metadata for fast command suggestions
 */

class MetadataCache {
  constructor() {
    this.cache = {
      sobjects: [],
      objectMetadata: {},
      fieldIds: {},
      layoutIds: {},
      flexiPageIds: {},
      validationRuleIds: {},
      triggerIds: {},
      lastUpdated: null
    };
    this.api = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize cache - load from storage or fetch from API
   */
  async init() {
    // Return existing init promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    if (this.isInitialized) {
      return;
    }

    console.log('🔄 Initializing MetadataCache...');

    // Initialize API client
    this.api = new SalesforceAPI();

    // CRITICAL: Wait for API initialization to complete!
    await this.api.init();

    // Try to load from storage first
    const cached = await this.loadFromStorage();

    if (cached && this.isCacheValid(cached)) {
      console.log('✅ Loaded metadata from cache');
      this.cache = cached;
      this.isInitialized = true;

      // Refresh in background
      this.refreshInBackground();
      return;
    }

    // Cache is stale or empty - fetch fresh data
    console.log('🔄 Cache is stale or empty, fetching fresh data...');
    await this.refreshCache();
    this.isInitialized = true;
  }

  /**
   * Check if cache is still valid (less than 1 hour old)
   */
  isCacheValid(cache) {
    if (!cache.lastUpdated) {
      return false;
    }

    const cacheAge = Date.now() - cache.lastUpdated;
    const maxAge = 60 * 60 * 1000; // 1 hour
    return cacheAge < maxAge;
  }

  /**
   * Refresh cache from Salesforce API
   */
  async refreshCache() {
    console.log('🔄 Refreshing metadata cache...');

    try {
      // Fetch all SObjects
      const sobjects = await this.api.getAllSObjects();

      if (!sobjects || sobjects.length === 0) {
        console.warn('⚠️ No SObjects returned, falling back to static list');
        this.cache.sobjects = this.getStaticSObjects();
        this.cache.lastUpdated = Date.now();
        await this.saveToStorage();
        return;
      }

      this.cache.sobjects = sobjects;
      this.cache.lastUpdated = Date.now();

      console.log(`✅ Cached ${sobjects.length} SObjects`);

      // Save to storage
      await this.saveToStorage();

      // Pre-fetch metadata for commonly used objects
      await this.preFetchCommonObjects();

    } catch (error) {
      console.error('❌ Failed to refresh cache:', error);
      console.log('💡 Falling back to static mode with common objects');

      // Fallback to static list
      this.cache.sobjects = this.getStaticSObjects();
      this.cache.lastUpdated = Date.now();
      await this.saveToStorage();
    }
  }

  /**
   * Get static list of common SObjects (fallback when API fails)
   */
  getStaticSObjects() {
    return [
      { name: 'Account', label: 'Account', labelPlural: 'Accounts', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Contact', label: 'Contact', labelPlural: 'Contacts', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Lead', label: 'Lead', labelPlural: 'Leads', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Opportunity', label: 'Opportunity', labelPlural: 'Opportunities', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Case', label: 'Case', labelPlural: 'Cases', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Task', label: 'Task', labelPlural: 'Tasks', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Event', label: 'Event', labelPlural: 'Events', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Campaign', label: 'Campaign', labelPlural: 'Campaigns', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'User', label: 'User', labelPlural: 'Users', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Product2', label: 'Product', labelPlural: 'Products', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Pricebook2', label: 'Pricebook', labelPlural: 'Pricebooks', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Quote', label: 'Quote', labelPlural: 'Quotes', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Order', label: 'Order', labelPlural: 'Orders', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Contract', label: 'Contract', labelPlural: 'Contracts', custom: false, queryable: true, searchable: true, layoutable: true },
      { name: 'Asset', label: 'Asset', labelPlural: 'Assets', custom: false, queryable: true, searchable: true, layoutable: true }
    ];
  }

  /**
   * Pre-fetch metadata for commonly used objects
   */
  async preFetchCommonObjects() {
    const commonObjects = ['Account', 'Contact', 'Lead', 'Opportunity', 'Case'];

    console.log('🔄 Pre-fetching metadata for common objects...');

    for (const objectName of commonObjects) {
      try {
        await this.getObjectMetadata(objectName);
      } catch (error) {
        console.error(`Failed to pre-fetch ${objectName}:`, error);
      }
    }

    console.log('✅ Pre-fetch complete');
  }

  /**
   * Refresh cache in background without blocking
   */
  refreshInBackground() {
    setTimeout(() => {
      console.log('🔄 Background cache refresh started...');
      this.refreshCache().catch(err => {
        console.error('Background refresh failed:', err);
      });
    }, 5000); // Wait 5 seconds before refreshing
  }

  /**
   * Get all SObjects
   */
  getSObjects() {
    return this.cache.sobjects || [];
  }

  /**
   * Get SObject by name
   */
  getSObject(objectName) {
    return this.cache.sobjects.find(obj =>
      obj.name.toLowerCase() === objectName.toLowerCase()
    );
  }

  /**
   * Search SObjects by partial name or label
   */
  searchSObjects(query) {
    const lowerQuery = query.toLowerCase();

    return this.cache.sobjects.filter(obj => {
      return obj.name.toLowerCase().includes(lowerQuery) ||
             obj.label.toLowerCase().includes(lowerQuery) ||
             obj.labelPlural.toLowerCase().includes(lowerQuery);
    }).slice(0, 20); // Return top 20 matches
  }

  /**
   * Get object metadata (fields, record types, etc.)
   */
  async getObjectMetadata(objectName) {
    // Check cache first
    if (this.cache.objectMetadata[objectName]) {
      return this.cache.objectMetadata[objectName];
    }

    // Fetch from API
    console.log(`🔄 Fetching metadata for ${objectName}...`);
    const metadata = await this.api.getObjectMetadata(objectName);

    if (metadata) {
      this.cache.objectMetadata[objectName] = metadata;
      await this.saveToStorage();
    }

    return metadata;
  }

  /**
   * Get fields for an object
   */
  async getFields(objectName) {
    const metadata = await this.getObjectMetadata(objectName);
    return metadata ? metadata.fields : [];
  }

  /**
   * Search fields within an object
   */
  async searchFields(objectName, query) {
    const fields = await this.getFields(objectName);
    const lowerQuery = query.toLowerCase();

    return fields.filter(field => {
      return field.name.toLowerCase().includes(lowerQuery) ||
             field.label.toLowerCase().includes(lowerQuery);
    }).slice(0, 20); // Return top 20 matches
  }

  /**
   * Get field ID (for direct navigation)
   */
  async getFieldId(objectName, fieldApiName) {
    const cacheKey = `${objectName}.${fieldApiName}`;

    // Check cache first
    if (this.cache.fieldIds[cacheKey]) {
      return this.cache.fieldIds[cacheKey];
    }

    // Query from API
    const fieldId = await this.api.getFieldId(objectName, fieldApiName);

    if (fieldId) {
      this.cache.fieldIds[cacheKey] = fieldId;
      await this.saveToStorage();
    }

    return fieldId;
  }

  /**
   * Get page layouts for an object
   */
  async getPageLayouts(objectName) {
    const cacheKey = objectName;

    // Check cache first
    if (this.cache.layoutIds[cacheKey]) {
      return this.cache.layoutIds[cacheKey];
    }

    // Query from API
    const layouts = await this.api.getPageLayouts(objectName);

    if (layouts && layouts.length > 0) {
      this.cache.layoutIds[cacheKey] = layouts;
      await this.saveToStorage();
    }

    return layouts;
  }

  /**
   * Search page layouts
   */
  async searchPageLayouts(objectName, query) {
    const layouts = await this.getPageLayouts(objectName);
    const lowerQuery = query.toLowerCase();

    return layouts.filter(layout => {
      return layout.name.toLowerCase().includes(lowerQuery);
    });
  }

  /**
   * Get FlexiPages for an object
   */
  async getFlexiPages(objectName) {
    const cacheKey = objectName;

    // Check cache first
    if (this.cache.flexiPageIds[cacheKey]) {
      return this.cache.flexiPageIds[cacheKey];
    }

    // Query from API
    const pages = await this.api.getFlexiPages(objectName);

    if (pages && pages.length > 0) {
      this.cache.flexiPageIds[cacheKey] = pages;
      await this.saveToStorage();
    }

    return pages;
  }

  /**
   * Get validation rules for an object
   */
  async getValidationRules(objectName) {
    const cacheKey = objectName;

    // Check cache first
    if (this.cache.validationRuleIds[cacheKey]) {
      return this.cache.validationRuleIds[cacheKey];
    }

    // Query from API
    const rules = await this.api.getValidationRules(objectName);

    if (rules && rules.length > 0) {
      this.cache.validationRuleIds[cacheKey] = rules;
      await this.saveToStorage();
    }

    return rules;
  }

  /**
   * Get Apex triggers for an object
   */
  async getApexTriggers(objectName) {
    const cacheKey = objectName;

    // Check cache first
    if (this.cache.triggerIds[cacheKey]) {
      return this.cache.triggerIds[cacheKey];
    }

    // Query from API
    const triggers = await this.api.getApexTriggers(objectName);

    if (triggers && triggers.length > 0) {
      this.cache.triggerIds[cacheKey] = triggers;
      await this.saveToStorage();
    }

    return triggers;
  }

  /**
   * Save cache to Chrome storage
   */
  async saveToStorage() {
    try {
      await chrome.storage.local.set({ 'slipstream_metadata_cache': this.cache });
      console.log('💾 Cache saved to storage');
    } catch (error) {
      console.error('❌ Failed to save cache:', error);
    }
  }

  /**
   * Load cache from Chrome storage
   */
  async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get('slipstream_metadata_cache');
      if (result.slipstream_metadata_cache) {
        console.log('📂 Cache loaded from storage');
        return result.slipstream_metadata_cache;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to load cache:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  async clearCache() {
    console.log('🗑️ Clearing cache...');
    this.cache = {
      sobjects: [],
      objectMetadata: {},
      fieldIds: {},
      layoutIds: {},
      flexiPageIds: {},
      validationRuleIds: {},
      triggerIds: {},
      lastUpdated: null
    };
    await chrome.storage.local.remove('slipstream_metadata_cache');
    console.log('✅ Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      sobjects: this.cache.sobjects.length,
      objectMetadata: Object.keys(this.cache.objectMetadata).length,
      fieldIds: Object.keys(this.cache.fieldIds).length,
      layoutIds: Object.keys(this.cache.layoutIds).length,
      flexiPageIds: Object.keys(this.cache.flexiPageIds).length,
      validationRuleIds: Object.keys(this.cache.validationRuleIds).length,
      triggerIds: Object.keys(this.cache.triggerIds).length,
      lastUpdated: this.cache.lastUpdated,
      age: this.cache.lastUpdated ? Date.now() - this.cache.lastUpdated : null
    };
  }
}

// Export for use in other scripts
window.MetadataCache = MetadataCache;
