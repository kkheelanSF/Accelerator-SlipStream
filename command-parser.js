/**
 * Salesforce SlipStream - Command Parser
 * Parses user input and matches to available commands
 */

class CommandParser {
  constructor() {
    this.commands = this.initializeCommands();
  }

  /**
   * Initialize command registry with all v0.2.0 commands
   */
  initializeCommands() {
    return [
      // Setup Navigation
      {
        pattern: /^open\s+setup(\s+home)?$/i,
        description: 'Navigate to Setup home page',
        category: 'Setup',
        handler: 'openSetup',
        examples: ['open setup', 'open setup home']
      },

      // Object Manager
      {
        pattern: /^open\s+object\s+manager$/i,
        description: 'Navigate to Object Manager',
        category: 'Setup',
        handler: 'openObjectManager',
        examples: ['open object manager']
      },

      // Open Setup Object (generic)
      {
        pattern: /^open\s+setup\s+(\w+)$/i,
        description: 'Navigate to specific object in Object Manager',
        category: 'Object Manager',
        handler: 'openSetupObject',
        examples: ['open setup Account', 'open setup Contact', 'open setup CustomObject__c'],
        paramNames: ['objectName']
      },

      // Open Setup Object Fields
      {
        pattern: /^open\s+setup\s+(\w+)\s+fields$/i,
        description: 'Navigate to Fields & Relationships for object',
        category: 'Object Manager',
        handler: 'openSetupObjectFields',
        examples: ['open setup Account Fields', 'open setup Contact Fields'],
        paramNames: ['objectName']
      },

      // Open Setup Object Field (specific field)
      {
        pattern: /^open\s+setup\s+(\w+)\s+field\s+(\w+)$/i,
        description: 'Navigate to specific field details',
        category: 'Object Manager',
        handler: 'openSetupObjectField',
        examples: ['open setup Account Field Industry', 'open setup Contact Field Email'],
        paramNames: ['objectName', 'fieldName']
      },

      // Open Setup Object Layout
      {
        pattern: /^open\s+setup\s+(\w+)\s+layout\s+(.+)$/i,
        description: 'Navigate to specific page layout editor',
        category: 'Object Manager',
        handler: 'openSetupObjectLayout',
        examples: ['open setup Account Layout Standard', 'open setup Opportunity Layout Sales Layout'],
        paramNames: ['objectName', 'layoutName']
      },

      // Open Setup Object Flexi Page
      {
        pattern: /^open\s+setup\s+(\w+)\s+flexi\s+page\s+(.+)$/i,
        description: 'Navigate to Lightning page builder for specific page',
        category: 'Object Manager',
        handler: 'openSetupObjectFlexiPage',
        examples: ['open setup Account Flexi Page Account_Record_Page'],
        paramNames: ['objectName', 'flexiPageName']
      },

      // Open Setup Object Validation Rules
      {
        pattern: /^open\s+setup\s+(\w+)\s+validation\s+rules$/i,
        description: 'Navigate to validation rules list for object',
        category: 'Object Manager',
        handler: 'openSetupObjectValidationRules',
        examples: ['open setup Account Validation Rules', 'open setup Opportunity Validation Rules'],
        paramNames: ['objectName']
      },

      // Open Setup Object Compact Layouts
      {
        pattern: /^open\s+setup\s+(\w+)\s+compact\s+layouts$/i,
        description: 'Navigate to compact layouts for object',
        category: 'Object Manager',
        handler: 'openSetupObjectCompactLayouts',
        examples: ['open setup Account Compact Layouts', 'open setup Contact Compact Layouts'],
        paramNames: ['objectName']
      },

      // Open Setup Object Record Types
      {
        pattern: /^open\s+setup\s+(\w+)\s+record\s+types$/i,
        description: 'Navigate to record types for object',
        category: 'Object Manager',
        handler: 'openSetupObjectRecordTypes',
        examples: ['open setup Account Record Types', 'open setup Opportunity Record Types'],
        paramNames: ['objectName']
      },

      // Developer Console
      {
        pattern: /^open\s+(dev|developer)\s+console$/i,
        description: 'Open Salesforce Developer Console in new tab',
        category: 'Developer Tools',
        handler: 'openDevConsole',
        examples: ['open dev console', 'open developer console']
      }
    ];
  }

  /**
   * Parse user input and find matching commands
   * @param {string} input - User's command input
   * @returns {Array} Array of matching command objects
   */
  parse(input) {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return [];
    }

    const matches = [];

    for (const command of this.commands) {
      const match = trimmedInput.match(command.pattern);

      if (match) {
        // Extract parameters if any
        const params = {};
        if (command.paramNames && match.length > 1) {
          command.paramNames.forEach((paramName, index) => {
            params[paramName] = match[index + 1];
          });
        }

        matches.push({
          command: command,
          params: params,
          input: trimmedInput,
          score: this.calculateScore(trimmedInput, command)
        });
      }
    }

    // Sort by score (exact matches first, then by relevance)
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  /**
   * Calculate match score for ranking
   * @param {string} input - User input
   * @param {object} command - Command definition
   * @returns {number} Score (higher is better)
   */
  calculateScore(input, command) {
    let score = 100;

    // Exact match bonus
    const firstExample = command.examples[0].toLowerCase();
    if (input.toLowerCase() === firstExample) {
      score += 1000;
    }

    // Starts with bonus
    if (firstExample.startsWith(input.toLowerCase())) {
      score += 500;
    }

    // Length penalty (prefer shorter commands)
    score -= input.length;

    return score;
  }

  /**
   * Get suggestions based on partial input
   * @param {string} input - Partial user input
   * @returns {Array} Array of suggested commands
   */
  getSuggestions(input) {
    const trimmedInput = input.trim().toLowerCase();

    if (!trimmedInput) {
      return this.getTopCommands();
    }

    const suggestions = [];

    for (const command of this.commands) {
      for (const example of command.examples) {
        if (example.toLowerCase().includes(trimmedInput)) {
          suggestions.push({
            command: command,
            example: example,
            score: this.calculateSuggestionScore(trimmedInput, example)
          });
          break; // Only add once per command
        }
      }
    }

    // Sort by score
    suggestions.sort((a, b) => b.score - a.score);

    return suggestions.slice(0, 10); // Return top 10
  }

  /**
   * Calculate suggestion score
   */
  calculateSuggestionScore(input, example) {
    let score = 0;
    const lowerExample = example.toLowerCase();
    const lowerInput = input.toLowerCase();

    // Starts with bonus
    if (lowerExample.startsWith(lowerInput)) {
      score += 1000;
    }

    // Contains bonus
    if (lowerExample.includes(lowerInput)) {
      score += 500;
    }

    // Word boundary bonus
    const words = lowerExample.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(lowerInput)) {
        score += 200;
      }
    }

    // Length penalty
    score -= example.length;

    return score;
  }

  /**
   * Get top/most common commands for empty input
   */
  getTopCommands() {
    const topCommands = [
      'open setup',
      'open object manager',
      'open dev console',
      'open setup Account',
      'open setup Contact',
      'open setup Opportunity'
    ];

    return topCommands.map(example => {
      const command = this.commands.find(cmd =>
        cmd.examples.includes(example)
      );
      return {
        command: command,
        example: example,
        score: 1000
      };
    });
  }

  /**
   * Validate command before execution
   */
  validate(match) {
    // Basic validation - can be extended
    if (!match || !match.command) {
      return { valid: false, error: 'Invalid command' };
    }

    // Validate object names (must be alphanumeric with optional underscores)
    if (match.params.objectName) {
      if (!/^[a-zA-Z0-9_]+$/.test(match.params.objectName)) {
        return { valid: false, error: 'Invalid object name' };
      }
    }

    return { valid: true };
  }
}

// Export for use in content.js
window.CommandParser = CommandParser;
