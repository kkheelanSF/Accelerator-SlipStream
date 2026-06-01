/**
 * Salesforce SlipStream - Content Script (Dynamic Version)
 * Handles keyboard shortcuts and UI injection with dynamic metadata
 */

class SlipStream {
  constructor() {
    this.isOpen = false;
    this.spotlightUI = null;
    this.parser = null;
    this.init();
  }

  async init() {
    // Listen for keyboard shortcut
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));

    // Initialize dynamic parser
    this.parser = new DynamicCommandParser();
    // Start initialization in background
    this.parser.init().then(() => {
      console.log('✅ Dynamic parser initialized');
    }).catch(err => {
      console.error('❌ Failed to initialize parser:', err);
    });

    console.log('🚀 Salesforce SlipStream loaded (Dynamic Mode)');
  }

  handleKeyPress(event) {
    // Primary trigger: CMD+Shift+L (Mac) or Ctrl+Shift+L (Windows/Linux)
    const isTriggerL = (event.metaKey || event.ctrlKey) && event.shiftKey &&
                       (event.key === 'L' || event.key === 'l');

    // Alternative trigger: CMD+Shift+Space
    const isTriggerSpace = (event.metaKey || event.ctrlKey) && event.shiftKey && event.key === ' ';

    // Test trigger: F8
    const isTriggerF8 = event.key === 'F8';

    // Legacy trigger: CMD+Shift+K
    const isTriggerK = (event.metaKey || event.ctrlKey) && event.shiftKey &&
                       (event.key === 'K' || event.key === 'k');

    if (isTriggerL || isTriggerSpace || isTriggerF8 || isTriggerK) {
      console.log('✅ SlipStream trigger detected!');
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
    }

    // ESC to close
    if (event.key === 'Escape' && this.isOpen) {
      event.preventDefault();
      this.close();
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (this.isOpen) return;

    // Create UI if it doesn't exist
    if (!this.spotlightUI) {
      this.spotlightUI = new SpotlightUI(this);
    }

    this.spotlightUI.show();
    this.isOpen = true;
  }

  close() {
    if (!this.isOpen) return;

    this.spotlightUI.hide();
    this.isOpen = false;
  }

  async handleCommand(suggestion) {
    console.log('Command received:', suggestion);

    if (!suggestion || !suggestion.handler) {
      console.error('Invalid command');
      return;
    }

    // Determine if command should open in new tab
    const newTabHandlers = [
      'openSetup',
      'openSetupQuickFind',
      'openObjectManager',
      'openSetupObject',
      'openSetupObjectFields',
      'openSetupObjectField',
      'openSetupObjectFieldDirect',
      'openSetupObjectLayouts',
      'openSetupObjectLayout',
      'openSetupObjectLayoutDirect',
      'openSetupObjectFlexiPages',
      'openSetupObjectFlexiPage',
      'openSetupObjectValidationRules',
      'openSetupObjectTriggers',
      'openSetupObjectButtons',
      'openSetupObjectCompactLayouts',
      'openSetupObjectRecordTypes'
    ];
    const openInNewTab = newTabHandlers.includes(suggestion.handler);

    // Execute command
    const urlBuilder = new URLBuilder();
    const success = await urlBuilder.executeCommand(
      suggestion.handler,
      suggestion.params,
      openInNewTab
    );

    if (success) {
      console.log('✅ Command executed successfully');
    } else {
      console.error('❌ Command execution failed');
    }

    this.close();
  }
}

/**
 * Spotlight UI Component (Dynamic Version)
 */
class SpotlightUI {
  constructor(slipStream) {
    this.slipStream = slipStream;
    this.selectedIndex = 0;
    this.suggestions = [];
    this.createUI();
    this.attachEventListeners();
  }

  createUI() {
    // Create backdrop overlay
    this.backdrop = document.createElement('div');
    this.backdrop.id = 'slipstream-backdrop';
    this.backdrop.className = 'slipstream-backdrop';

    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'slipstream-container';
    this.container.className = 'slipstream-container';

    // Create search box
    this.searchBox = document.createElement('div');
    this.searchBox.className = 'slipstream-search-box';

    // Input field
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'slipstream-input';
    this.input.placeholder = 'Type a command... (e.g., "open setup Account")';
    this.input.autocomplete = 'off';
    this.input.spellcheck = false;

    this.searchBox.appendChild(this.input);

    // Create results container
    this.resultsContainer = document.createElement('div');
    this.resultsContainer.className = 'slipstream-results';

    // Create loading state
    this.loadingState = document.createElement('div');
    this.loadingState.className = 'slipstream-loading';
    this.loadingState.innerHTML = `
      <div class="slipstream-loading-icon">⏳</div>
      <div class="slipstream-loading-text">Loading metadata...</div>
    `;

    // Create empty state
    this.emptyState = document.createElement('div');
    this.emptyState.className = 'slipstream-empty-state';
    this.emptyState.innerHTML = `
      <div class="slipstream-empty-icon">⌘</div>
      <div class="slipstream-empty-title">Salesforce SlipStream</div>
      <div class="slipstream-empty-subtitle">Type a command to get started</div>
      <div class="slipstream-empty-hint">Try: "open setup Account" or "open dev console"</div>
    `;

    // Assemble UI
    this.container.appendChild(this.searchBox);
    this.container.appendChild(this.resultsContainer);
    this.container.appendChild(this.loadingState);
    this.container.appendChild(this.emptyState);
  }

  attachEventListeners() {
    // Input events
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Click backdrop to close
    this.backdrop.addEventListener('click', () => this.slipStream.close());

    // Prevent clicks inside container from closing
    this.container.addEventListener('click', (e) => e.stopPropagation());
  }

  async handleInput(event) {
    const query = event.target.value;

    if (query.length === 0) {
      this.showEmptyState();
      return;
    }

    // Show loading state
    this.showLoading();

    try {
      // Get suggestions from dynamic parser
      const suggestions = await this.slipStream.parser.parse(query);

      if (suggestions && suggestions.length > 0) {
        this.showSuggestions(suggestions);
      } else {
        this.showNoResults(query);
      }
    } catch (error) {
      console.error('Error parsing command:', error);
      this.showError();
    }
  }

  handleKeyDown(event) {
    const resultsVisible = this.suggestions.length > 0;

    switch (event.key) {
      case 'ArrowDown':
        if (resultsVisible) {
          event.preventDefault();
          this.selectNext();
        }
        break;
      case 'ArrowUp':
        if (resultsVisible) {
          event.preventDefault();
          this.selectPrevious();
        }
        break;
      case 'Enter':
        if (resultsVisible) {
          event.preventDefault();
          this.executeSelected();
        }
        break;
    }
  }

  selectNext() {
    if (this.suggestions.length === 0) return;

    this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
    this.updateSelection();
  }

  selectPrevious() {
    if (this.suggestions.length === 0) return;

    this.selectedIndex = (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
    this.updateSelection();
  }

  executeSelected() {
    if (this.suggestions.length === 0) return;

    const selected = this.suggestions[this.selectedIndex];
    if (selected) {
      this.slipStream.handleCommand(selected);
    }
  }

  updateSelection() {
    const items = this.resultsContainer.querySelectorAll('.slipstream-result-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  showLoading() {
    this.resultsContainer.style.display = 'none';
    this.emptyState.style.display = 'none';
    this.loadingState.style.display = 'flex';
  }

  showEmptyState() {
    this.resultsContainer.style.display = 'none';
    this.loadingState.style.display = 'none';
    this.emptyState.style.display = 'flex';
  }

  showSuggestions(suggestions) {
    this.loadingState.style.display = 'none';
    this.emptyState.style.display = 'none';
    this.resultsContainer.style.display = 'block';
    this.suggestions = suggestions;
    this.selectedIndex = 0;

    let html = '';
    suggestions.forEach((suggestion, index) => {
      const isSelected = index === 0 ? 'selected' : '';
      const icon = this.getIconForCategory(suggestion.category);

      html += `
        <div class="slipstream-result-item ${isSelected}" data-index="${index}">
          <div class="slipstream-result-icon">${icon}</div>
          <div class="slipstream-result-content">
            <div class="slipstream-result-title">${this.escapeHtml(suggestion.command)}</div>
            <div class="slipstream-result-description">${this.escapeHtml(suggestion.description)}</div>
          </div>
          <div class="slipstream-result-category">${this.escapeHtml(suggestion.category)}</div>
        </div>
      `;
    });

    this.resultsContainer.innerHTML = html;

    // Add click handlers
    const items = this.resultsContainer.querySelectorAll('.slipstream-result-item');
    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.executeSelected();
      });
    });
  }

  getIconForCategory(category) {
    const icons = {
      'Setup': '⚙️',
      'Object Manager': '📦',
      'Fields': '🔤',
      'Developer Tools': '👨‍💻',
      'Common Objects': '⭐'
    };
    return icons[category] || '⚡';
  }

  showNoResults(query) {
    this.loadingState.style.display = 'none';
    this.emptyState.style.display = 'none';
    this.resultsContainer.style.display = 'block';
    this.suggestions = [];
    this.resultsContainer.innerHTML = `
      <div class="slipstream-no-results">
        <div class="slipstream-no-results-icon">🔍</div>
        <div class="slipstream-no-results-title">No commands found</div>
        <div class="slipstream-no-results-query">Try: "open setup" or "open dev console"</div>
      </div>
    `;
  }

  showError() {
    this.loadingState.style.display = 'none';
    this.emptyState.style.display = 'none';
    this.resultsContainer.style.display = 'block';
    this.suggestions = [];
    this.resultsContainer.innerHTML = `
      <div class="slipstream-no-results">
        <div class="slipstream-no-results-icon">❌</div>
        <div class="slipstream-no-results-title">Error loading commands</div>
        <div class="slipstream-no-results-query">Please try again or reload the page</div>
      </div>
    `;
  }

  show() {
    // Add to DOM
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.container);

    // Trigger animation
    requestAnimationFrame(() => {
      this.backdrop.classList.add('slipstream-active');
      this.container.classList.add('slipstream-active');
      this.input.focus();

      // Show empty state initially
      this.showEmptyState();
    });
  }

  hide() {
    // Remove animation classes
    this.backdrop.classList.remove('slipstream-active');
    this.container.classList.remove('slipstream-active');

    // Remove from DOM after animation
    setTimeout(() => {
      if (this.backdrop.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
      }
      if (this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }

      // Reset state
      this.input.value = '';
      this.suggestions = [];
      this.selectedIndex = 0;
    }, 200);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize SlipStream
const slipstream = new SlipStream();
