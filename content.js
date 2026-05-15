/**
 * Salesforce SlipStream - Content Script
 * Handles keyboard shortcuts and UI injection
 */

class SlipStream {
  constructor() {
    this.isOpen = false;
    this.spotlightUI = null;
    this.init();
  }

  init() {
    // Listen for keyboard shortcut
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    console.log('🚀 Salesforce SlipStream loaded');
  }

  handleKeyPress(event) {
    // Debug: Log all key presses with modifiers
    if (event.metaKey || event.ctrlKey) {
      console.log('🔑 Key pressed:', {
        key: event.key,
        code: event.code,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey
      });
    }

    // Primary trigger: CMD+Shift+L (Mac) or Ctrl+Shift+L (Windows/Linux)
    // Changed from K to L to avoid conflicts
    const isTriggerL = (event.metaKey || event.ctrlKey) && event.shiftKey &&
                       (event.key === 'L' || event.key === 'l');

    // Alternative trigger: CMD+Shift+Space (easier to press)
    const isTriggerSpace = (event.metaKey || event.ctrlKey) && event.shiftKey && event.key === ' ';

    // Test trigger: F8 (no modifiers needed - easiest to test!)
    const isTriggerF8 = event.key === 'F8';

    // Legacy trigger: CMD+Shift+K (in case it works for you)
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

  handleCommand(command) {
    // Placeholder for v0.2.0 - command execution
    console.log('Command received:', command);
    this.close();
  }
}

/**
 * Spotlight UI Component
 */
class SpotlightUI {
  constructor(slipStream) {
    this.slipStream = slipStream;
    this.selectedIndex = 0;
    this.filteredCommands = [];
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

    // Input field (no icon)
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'slipstream-input';
    this.input.placeholder = 'Type a command...';
    this.input.autocomplete = 'off';
    this.input.spellcheck = false;

    this.searchBox.appendChild(this.input);

    // Create results container
    this.resultsContainer = document.createElement('div');
    this.resultsContainer.className = 'slipstream-results';

    // Create empty state
    this.emptyState = document.createElement('div');
    this.emptyState.className = 'slipstream-empty-state';
    this.emptyState.innerHTML = `
      <div class="slipstream-empty-icon">⌘</div>
      <div class="slipstream-empty-title">Salesforce SlipStream</div>
      <div class="slipstream-empty-subtitle">Type a command to get started</div>
    `;

    // Assemble UI
    this.container.appendChild(this.searchBox);
    this.container.appendChild(this.resultsContainer);
    this.container.appendChild(this.emptyState);

    // Don't append to DOM yet - will be added on show()
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

  handleInput(event) {
    const query = event.target.value.trim();

    if (query.length === 0) {
      this.showEmptyState();
      return;
    }

    // Placeholder: Show "coming soon" message for now
    this.showComingSoonState(query);
  }

  handleKeyDown(event) {
    const resultsVisible = this.resultsContainer.children.length > 0;

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
    // Placeholder for v0.2.0
  }

  selectPrevious() {
    // Placeholder for v0.2.0
  }

  executeSelected() {
    // Placeholder for v0.2.0
  }

  showEmptyState() {
    this.resultsContainer.innerHTML = '';
    this.resultsContainer.style.display = 'none';
    this.emptyState.style.display = 'flex';
  }

  showComingSoonState(query) {
    this.emptyState.style.display = 'none';
    this.resultsContainer.style.display = 'block';
    this.resultsContainer.innerHTML = `
      <div class="slipstream-coming-soon">
        <div class="slipstream-coming-soon-icon">🚧</div>
        <div class="slipstream-coming-soon-title">Command execution coming in v0.2.0</div>
        <div class="slipstream-coming-soon-query">You typed: <strong>${this.escapeHtml(query)}</strong></div>
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
      this.showEmptyState();
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
