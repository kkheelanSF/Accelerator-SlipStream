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

    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return this.getDefaultSuggestions();
    }

    const suggestions = [];

    // Parse command structure
    // Keep original case for extracting IDs and case-sensitive values
    const originalParts = trimmedInput.split(/\s+/);
    // Use lowercase for keyword matching
    const parts = trimmedInput.toLowerCase().split(/\s+/);
    const keyword = parts[0]; // "open", "create", etc.

    if (keyword === 'open') {
      return await this.parseOpenCommand(parts, originalParts);
    }

    return suggestions;
  }

  /**
   * Parse "open" commands
   */
  async parseOpenCommand(parts, originalParts = parts) {
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

    // open debug logs
    if (secondKeyword === 'debug') {
      if (parts.length === 3 && parts[2] === 'logs') {
        suggestions.push({
          command: 'open debug logs',
          description: 'Navigate to Debug Logs page',
          category: 'Debug',
          handler: 'openDebugLogs',
          params: {},
          score: 1000
        });
      }
      // open debug log {ID}
      if (parts.length === 4 && parts[2] === 'log') {
        const logId = originalParts[3]; // Use original case for ID
        suggestions.push({
          command: `open debug log ${logId}`,
          description: 'Open specific debug log viewer',
          category: 'Debug',
          handler: 'openDebugLog',
          params: { logId },
          score: 1000
        });
      }
    }

    // open system log
    if (secondKeyword === 'system' && parts.length === 3 && parts[2] === 'log') {
      suggestions.push({
        command: 'open system log',
        description: 'Navigate to System Overview logs',
        category: 'Monitoring',
        handler: 'openSystemLog',
        params: {},
        score: 1000
      });
    }

    // open event log
    if (secondKeyword === 'event' && parts.length === 3 && parts[2] === 'log') {
      suggestions.push({
        command: 'open event log',
        description: 'Navigate to Event Monitoring logs',
        category: 'Monitoring',
        handler: 'openEventLog',
        params: {},
        score: 1000
      });
    }

    // open email logs
    if (secondKeyword === 'email' && parts.length === 3 && parts[2] === 'logs') {
      suggestions.push({
        command: 'open email logs',
        description: 'Navigate to Email Log Files',
        category: 'Monitoring',
        handler: 'openEmailLogs',
        params: {},
        score: 1000
      });
    }

    // open scheduled jobs
    if (secondKeyword === 'scheduled' && parts.length === 3 && parts[2] === 'jobs') {
      suggestions.push({
        command: 'open scheduled jobs',
        description: 'Navigate to Scheduled Jobs page',
        category: 'Monitoring',
        handler: 'openScheduledJobs',
        params: {},
        score: 1000
      });
    }

    // open users
    if (secondKeyword === 'users' || secondKeyword === 'user') {
      if (parts.length === 2 && secondKeyword === 'users') {
        suggestions.push({
          command: 'open users',
          description: 'Navigate to Users list in Setup',
          category: 'User Management',
          handler: 'openUsers',
          params: {},
          score: 1000
        });
      }
      // open user {Username/ID}
      if (parts.length === 3 && secondKeyword === 'user') {
        const userIdentifier = originalParts[2]; // Preserve case for user IDs
        suggestions.push({
          command: `open user ${userIdentifier}`,
          description: 'Navigate to specific user details page',
          category: 'User Management',
          handler: 'openUser',
          params: { userIdentifier },
          score: 1000
        });
      }
    }

    // open active users (NOT IMPLEMENTED - no URL filter available)
    // if (secondKeyword === 'active' && parts.length === 3 && parts[2] === 'users') {
    //   suggestions.push({
    //     command: 'open active users',
    //     description: 'Navigate to active users list',
    //     category: 'User Management',
    //     handler: 'openActiveUsers',
    //     params: {},
    //     score: 1000
    //   });
    // }

    // open frozen users (NOT IMPLEMENTED - no URL filter available)
    // if (secondKeyword === 'frozen' && parts.length === 3 && parts[2] === 'users') {
    //   suggestions.push({
    //     command: 'open frozen users',
    //     description: 'Navigate to frozen users list',
    //     category: 'User Management',
    //     handler: 'openFrozenUsers',
    //     params: {},
    //     score: 1000
    //   });
    // }

    // open profiles
    if (secondKeyword === 'profiles' || secondKeyword === 'profile') {
      if (parts.length === 2 && secondKeyword === 'profiles') {
        suggestions.push({
          command: 'open profiles',
          description: 'Navigate to Profiles list in Setup',
          category: 'Security',
          handler: 'openProfiles',
          params: {},
          score: 1000
        });
      }
      // open profile {Name}
      if (parts.length >= 3 && secondKeyword === 'profile') {
        const profileName = parts.slice(2).join(' ');
        suggestions.push({
          command: `open profile ${profileName}`,
          description: 'Navigate to specific profile details',
          category: 'Security',
          handler: 'openProfile',
          params: { profileName },
          score: 1000
        });
      }
    }

    // open permission sets / set
    if (secondKeyword === 'permission') {
      // open permission sets
      if (parts.length === 3 && parts[2] === 'sets') {
        suggestions.push({
          command: 'open permission sets',
          description: 'Navigate to Permission Sets list',
          category: 'Security',
          handler: 'openPermissionSets',
          params: {},
          score: 1000
        });
      }
      // open permission set {Name}
      if (parts.length >= 4 && parts[2] === 'set' && parts[3] !== 'groups' && parts[3] !== 'group') {
        const permissionSetName = parts.slice(3).join(' ');
        suggestions.push({
          command: `open permission set ${permissionSetName}`,
          description: 'Navigate to specific permission set details',
          category: 'Security',
          handler: 'openPermissionSet',
          params: { permissionSetName },
          score: 1000
        });
      }
      // open permission set groups
      if (parts.length === 4 && parts[2] === 'set' && parts[3] === 'groups') {
        suggestions.push({
          command: 'open permission set groups',
          description: 'Navigate to Permission Set Groups',
          category: 'Security',
          handler: 'openPermissionSetGroups',
          params: {},
          score: 1000
        });
      }
      // open permission set group {Name}
      if (parts.length >= 5 && parts[2] === 'set' && parts[3] === 'group') {
        const groupName = parts.slice(4).join(' ');
        suggestions.push({
          command: `open permission set group ${groupName}`,
          description: 'Navigate to specific permission set group',
          category: 'Security',
          handler: 'openPermissionSetGroup',
          params: { groupName },
          score: 1000
        });
      }
    }

    // open apex
    if (secondKeyword === 'apex') {
      // open apex classes
      if (parts.length === 3 && parts[2] === 'classes') {
        suggestions.push({
          command: 'open apex classes',
          description: 'Navigate to Apex Classes list',
          category: 'Developer',
          handler: 'openApexClasses',
          params: {},
          score: 1000
        });
      }
      // open apex class {Name}
      if (parts.length >= 4 && parts[2] === 'class') {
        const className = parts.slice(3).join(' ');
        suggestions.push({
          command: `open apex class ${className}`,
          description: 'Navigate to specific Apex class editor',
          category: 'Developer',
          handler: 'openApexClass',
          params: { className },
          score: 1000
        });
      }
      // open apex triggers
      if (parts.length === 3 && parts[2] === 'triggers') {
        suggestions.push({
          command: 'open apex triggers',
          description: 'Navigate to Apex Triggers list',
          category: 'Developer',
          handler: 'openApexTriggers',
          params: {},
          score: 1000
        });
      }
      // open apex trigger {Name}
      if (parts.length >= 4 && parts[2] === 'trigger') {
        const triggerName = parts.slice(3).join(' ');
        suggestions.push({
          command: `open apex trigger ${triggerName}`,
          description: 'Navigate to specific Apex trigger editor',
          category: 'Developer',
          handler: 'openApexTrigger',
          params: { triggerName },
          score: 1000
        });
      }
      // open apex test execution
      if (parts.length === 4 && parts[2] === 'test' && parts[3] === 'execution') {
        suggestions.push({
          command: 'open apex test execution',
          description: 'Navigate to Apex Test Execution page',
          category: 'Developer',
          handler: 'openApexTestExecution',
          params: {},
          score: 1000
        });
      }
      // open apex jobs
      if (parts.length === 3 && parts[2] === 'jobs') {
        suggestions.push({
          command: 'open apex jobs',
          description: 'Navigate to Apex Jobs monitoring page',
          category: 'Developer',
          handler: 'openApexJobs',
          params: {},
          score: 1000
        });
      }
    }

    // open anonymous apex
    if (secondKeyword === 'anonymous' && parts.length === 3 && parts[2] === 'apex') {
      suggestions.push({
        command: 'open anonymous apex',
        description: 'Open anonymous Apex execution window',
        category: 'Developer',
        handler: 'openAnonymousApex',
        params: {},
        score: 1000
      });
    }

    // open visualforce
    if (secondKeyword === 'visualforce') {
      // open visualforce pages
      if (parts.length === 3 && parts[2] === 'pages') {
        suggestions.push({
          command: 'open visualforce pages',
          description: 'Navigate to Visualforce Pages list',
          category: 'Developer',
          handler: 'openVisualforcePages',
          params: {},
          score: 1000
        });
      }
      // open visualforce page {Name}
      if (parts.length >= 4 && parts[2] === 'page') {
        const pageName = parts.slice(3).join(' ');
        suggestions.push({
          command: `open visualforce page ${pageName}`,
          description: 'Navigate to specific Visualforce page editor',
          category: 'Developer',
          handler: 'openVisuaforcePage',
          params: { pageName },
          score: 1000
        });
      }
      // open visualforce components
      if (parts.length === 3 && parts[2] === 'components') {
        suggestions.push({
          command: 'open visualforce components',
          description: 'Navigate to Visualforce Components list',
          category: 'Developer',
          handler: 'openVisualforceComponents',
          params: {},
          score: 1000
        });
      }
      // open visualforce component {Name}
      if (parts.length >= 4 && parts[2] === 'component') {
        const componentName = parts.slice(3).join(' ');
        suggestions.push({
          command: `open visualforce component ${componentName}`,
          description: 'Navigate to specific component editor',
          category: 'Developer',
          handler: 'openVisualforceComponent',
          params: { componentName },
          score: 1000
        });
      }
    }

    // open lightning
    if (secondKeyword === 'lightning') {
      // open lightning components
      if (parts.length === 3 && parts[2] === 'components') {
        suggestions.push({
          command: 'open lightning components',
          description: 'Navigate to Lightning Components list',
          category: 'Developer',
          handler: 'openLightningComponents',
          params: {},
          score: 1000
        });
      }
      // open lightning component {Name}
      if (parts.length >= 4 && parts[2] === 'component') {
        const componentName = parts.slice(3).join(' ');
        suggestions.push({
          command: `open lightning component ${componentName}`,
          description: 'Navigate to specific Lightning component',
          category: 'Developer',
          handler: 'openLightningComponent',
          params: { componentName },
          score: 1000
        });
      }
    }

    // open aura bundle {Name}
    if (secondKeyword === 'aura' && parts.length >= 4 && parts[2] === 'bundle') {
      const bundleName = parts.slice(3).join(' ');
      suggestions.push({
        command: `open aura bundle ${bundleName}`,
        description: 'Navigate to specific Aura bundle',
        category: 'Developer',
        handler: 'openAuraBundle',
        params: { bundleName },
        score: 1000
      });
    }

    // open lwc {Name}
    if (secondKeyword === 'lwc' && parts.length >= 3) {
      const componentName = parts.slice(2).join(' ');
      suggestions.push({
        command: `open lwc ${componentName}`,
        description: 'Navigate to specific Lightning Web Component',
        category: 'Developer',
        handler: 'openLWC',
        params: { componentName },
        score: 1000
      });
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

      // open setup Account FlexiPage [PageName]
      if (subCommand === 'flexipage' && parts.length >= 5) {
        const pageQuery = parts.slice(4).join(' '); // FlexiPage names can have spaces
        const pageSuggestions = await this.suggestFlexiPages(objectName, pageQuery);
        suggestions.push(...pageSuggestions);
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
   * Suggest matching FlexiPages for an object
   */
  async suggestFlexiPages(objectName, pageQuery) {
    const suggestions = [];

    // Get all FlexiPages for the object
    const pages = await this.metadataCache.getFlexiPages(objectName);

    if (!pages || pages.length === 0) {
      return suggestions;
    }

    // Filter pages by query (search in name or label)
    const lowerQuery = pageQuery.toLowerCase();
    const matchedPages = pages.filter(page => {
      return (page.name && page.name.toLowerCase().includes(lowerQuery)) ||
             (page.label && page.label.toLowerCase().includes(lowerQuery));
    });

    for (const page of matchedPages.slice(0, 10)) {
      suggestions.push({
        command: `open setup ${objectName} FlexiPage ${page.name}`,
        description: `${page.label} (${page.name})`,
        category: 'Lightning Pages',
        handler: 'openSetupObjectFlexiPageDirect',
        params: { objectName, flexiPageName: page.name },
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
