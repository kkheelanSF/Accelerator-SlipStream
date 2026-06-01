/**
 * Salesforce SlipStream - Dynamic Command Parser
 * Uses metadata cache to provide intelligent suggestions for all SObjects
 */

class DynamicCommandParser {
  constructor() {
    this.metadataCache = null;
    this.isReady = false;
    this.initPromise = null;
  }

  /**
   * Initialize parser with metadata cache
   */
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    if (this.isReady) {
      return;
    }

    console.log('🔄 Initializing DynamicCommandParser...');

    // Initialize metadata cache
    this.metadataCache = new MetadataCache();
    await this.metadataCache.init();

    this.isReady = true;
    console.log('✅ DynamicCommandParser ready');
  }

  /**
   * Parse user input and generate suggestions
   */
  async parse(input) {
    if (!this.isReady) {
      await this.init();
    }

    const trimmedInput = input.trim().toLowerCase();

    if (!trimmedInput) {
      return this.getDefaultSuggestions();
    }

    const suggestions = [];

    // Parse command structure
    const parts = trimmedInput.split(/\s+/);
    const keyword = parts[0]; // "open", "create", etc.

    if (keyword === 'open') {
      return await this.parseOpenCommand(parts);
    }

    return suggestions;
  }

  /**
   * Parse "open" commands
   */
  async parseOpenCommand(parts) {
    const suggestions = [];

    // open setup
    if (parts.length === 1) {
      return this.getOpenSuggestions();
    }

    const secondKeyword = parts[1];

    // open setup ...
    if (secondKeyword === 'setup') {
      return await this.parseSetupCommand(parts);
    }

    // open object manager
    if (secondKeyword === 'object' && parts[2] === 'manager') {
      suggestions.push({
        command: 'open object manager',
        description: 'Navigate to Object Manager',
        category: 'Setup',
        handler: 'openObjectManager',
        params: {},
        score: 1000
      });
    }

    // open dev console
    if (secondKeyword === 'dev' || secondKeyword === 'developer') {
      if (parts.length === 2 || (parts.length === 3 && parts[2] === 'console')) {
        suggestions.push({
          command: 'open dev console',
          description: 'Open Salesforce Developer Console',
          category: 'Developer Tools',
          handler: 'openDevConsole',
          params: {},
          score: 1000
        });
      }
    }

    return suggestions;
  }

  /**
   * Parse "open setup" commands
   */
  async parseSetupCommand(parts) {
    const suggestions = [];

    // open setup (home)
    if (parts.length === 2 || (parts.length === 3 && parts[2] === 'home')) {
      suggestions.push({
        command: 'open setup',
        description: 'Navigate to Setup home page',
        category: 'Setup',
        handler: 'openSetup',
        params: {},
        score: 1000
      });
      return suggestions;
    }

    //open setup quick find [term]
    if (parts.length >= 4 && parts[2] === 'quick' && parts[3] === 'find') {
      const searchTerm = parts.slice(4).join(' ');
      suggestions.push({
        command: `open setup quick find ${searchTerm}`,
        description: 'Quick Find search in Setup',
        category: 'Setup',
        handler: 'openSetupQuickFind',
        params: { searchTerm },
        score: 1000
      });
      return suggestions;
    }

    // open setup [Object] ...
    const objectQuery = parts[2];

    if (!objectQuery) {
      return suggestions;
    }

    // If we only have "open setup [partial]", suggest matching objects
    if (parts.length === 3) {
      return await this.suggestObjects(objectQuery);
    }

    // open setup [Object] [SubCommand]
    const subCommand = parts[3];

    // Get all objects matching the query
    const matchingObjects = this.metadataCache.searchSObjects(objectQuery);

    for (const obj of matchingObjects.slice(0, 5)) { // Top 5 objects
      const objectName = obj.name;

      // open setup Account Fields
      if (subCommand === 'fields') {
        suggestions.push({
          command: `open setup ${objectName} Fields`,
          description: `Navigate to Fields & Relationships for ${obj.label}`,
          category: 'Object Manager',
          handler: 'openSetupObjectFields',
          params: { objectName },
          score: 900
        });
      }

      // open setup Account Layouts
      if (subCommand === 'layouts') {
        suggestions.push({
          command: `open setup ${objectName} Layouts`,
          description: `Navigate to Page Layouts for ${obj.label}`,
          category: 'Object Manager',
          handler: 'openSetupObjectLayouts',
          params: { objectName },
          score: 900
        });
      }

      // open setup Account FlexiPages
      if (subCommand === 'flexipages') {
        suggestions.push({
          command: `open setup ${objectName} FlexiPages`,
          description: `Navigate to Lightning Pages for ${obj.label}`,
          category: 'Object Manager',
          handler: 'openSetupObjectFlexiPages',
          params: { objectName },
          score: 900
        });
      }

      // open setup Account ValidationRules
      if (subCommand === 'validationrules') {
        suggestions.push({
          command: `open setup ${objectName} ValidationRules`,
          description: `Navigate to Validation Rules for ${obj.label}`,
          category: 'Object Manager',
          handler: 'openSetupObjectValidationRules',
          params: { objectName },
          score: 900
        });
      }

      // open setup Account Triggers
      if (subCommand === 'triggers') {
        suggestions.push({
          command: `open setup ${objectName} Triggers`,
          description: `Navigate to Apex Triggers for ${obj.label}`,
          category: 'Object Manager',
          handler: 'openSetupObjectTriggers',
          params: { objectName },
          score: 900
        });
      }

      // open setup Account Buttons
      if (subCommand === 'buttons') {
        suggestions.push({
          command: `open setup ${objectName} Buttons`,
          description: `Navigate to Buttons & Actions for ${obj.label}`,
          category: 'Object Manager',
          handler: 'openSetupObjectButtons',
          params: { objectName },
          score: 900
        });
      }

      // open setup Account CompactLayouts
      if (subCommand === 'compactlayouts') {
        suggestions.push({
          command: `open setup ${objectName} CompactLayouts`,
          description: `Navigate to Compact Layouts for ${obj.label}`,
          category: 'Object Manager',
          handler: 'openSetupObjectCompactLayouts',
          params: { objectName },
          score: 900
        });
      }

      // open setup Account RecordTypes
      if (subCommand === 'recordtypes') {
        suggestions.push({
          command: `open setup ${objectName} RecordTypes`,
          description: `Navigate to Record Types for ${obj.label}`,
          category: 'Object Manager',
          handler: 'openSetupObjectRecordTypes',
          params: { objectName },
          score: 900
        });
      }

      // open setup Account Field [FieldName]
      if (subCommand === 'field' && parts.length >= 5) {
        const fieldQuery = parts[4];
        const fieldSuggestions = await this.suggestFields(objectName, fieldQuery);
        suggestions.push(...fieldSuggestions);
      }

      // If just "open setup Account" with exact match
      if (parts.length === 3) {
        suggestions.push({
          command: `open setup ${objectName}`,
          description: `Navigate to ${obj.label} in Object Manager`,
          category: 'Object Manager',
          handler: 'openSetupObject',
          params: { objectName },
          score: 1000
        });
      }
    }

    return suggestions;
  }

  /**
   * Suggest matching objects
   */
  async suggestObjects(query) {
    const suggestions = [];
    const objects = this.metadataCache.searchSObjects(query);

    for (const obj of objects.slice(0, 10)) {
      suggestions.push({
        command: `open setup ${obj.name}`,
        description: `Navigate to ${obj.label} in Object Manager`,
        category: 'Object Manager',
        handler: 'openSetupObject',
        params: { objectName: obj.name },
        score: 900
      });
    }

    return suggestions;
  }

  /**
   * Suggest matching fields for an object
   */
  async suggestFields(objectName, fieldQuery) {
    const suggestions = [];
    const fields = await this.metadataCache.searchFields(objectName, fieldQuery);

    for (const field of fields.slice(0, 10)) {
      suggestions.push({
        command: `open setup ${objectName} Field ${field.name}`,
        description: `${field.label} (${field.name}) - ${field.type}`,
        category: 'Fields',
        handler: 'openSetupObjectFieldDirect',
        params: { objectName, fieldApiName: field.name },
        score: 800
      });
    }

    return suggestions;
  }

  /**
   * Get default suggestions (when input is empty)
   */
  getDefaultSuggestions() {
    return [
      {
        command: 'open setup',
        description: 'Navigate to Setup home page',
        category: 'Setup',
        handler: 'openSetup',
        params: {},
        score: 1000
      },
      {
        command: 'open setup quick find',
        description: 'Quick Find search in Setup',
        category: 'Setup',
        handler: null,
        params: {},
        score: 900
      },
      {
        command: 'open object manager',
        description: 'Navigate to Object Manager',
        category: 'Setup',
        handler: 'openObjectManager',
        params: {},
        score: 1000
      },
      {
        command: 'open dev console',
        description: 'Open Developer Console',
        category: 'Developer Tools',
        handler: 'openDevConsole',
        params: {},
        score: 1000
      },
      {
        command: 'open setup Account',
        description: 'Navigate to Account object',
        category: 'Common Objects',
        handler: 'openSetupObject',
        params: { objectName: 'Account' },
        score: 800
      },
      {
        command: 'open setup Contact',
        description: 'Navigate to Contact object',
        category: 'Common Objects',
        handler: 'openSetupObject',
        params: { objectName: 'Contact' },
        score: 800
      }
    ];
  }

  /**
   * Get suggestions for "open" keyword
   */
  getOpenSuggestions() {
    return [
      {
        command: 'open setup',
        description: 'Navigate to Setup home',
        category: 'Setup',
        handler: 'openSetup',
        params: {},
        score: 1000
      },
      {
        command: 'open object manager',
        description: 'Navigate to Object Manager',
        category: 'Setup',
        handler: 'openObjectManager',
        params: {},
        score: 1000
      },
      {
        command: 'open dev console',
        description: 'Open Developer Console',
        category: 'Developer Tools',
        handler: 'openDevConsole',
        params: {},
        score: 1000
      }
    ];
  }

  /**
   * Validate parsed command
   */
  validate(suggestion) {
    if (!suggestion || !suggestion.handler) {
      return { valid: false, error: 'Invalid command' };
    }

    return { valid: true };
  }
}

// Export for use in content.js
window.DynamicCommandParser = DynamicCommandParser;
