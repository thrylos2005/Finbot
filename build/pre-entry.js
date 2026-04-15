// This script runs before any React code to ensure compatibility
// Aggressive protection against Console constructor errors
(function() {
  try {
    // --- Console Constructor Protection ---
    
    // First line of defense: remove Console constructor
    delete window.Console;
    
    // Second line of defense: getter trap
    Object.defineProperty(window, 'Console', {
      configurable: true,
      get: function() {
        console.warn('[pre-entry.js] Blocked access to Console constructor');
        return null;
      },
      set: function() {
        console.warn('[pre-entry.js] Blocked attempt to set Console constructor');
        return;
      }
    });
    
    // --- Binance Connector Fix ---
    // Intercept the 'console' module used by @binance/connector
    // It destructures the Console constructor with: const { Console } = require('console')
    
    // Create a fake console module to return when requested
    const fakeConsoleModule = Object.create(console);
    
    // Add a fake Console constructor that won't throw errors
    fakeConsoleModule.Console = function(options) {
      this.log = function() { console.log.apply(console, arguments); };
      this.error = function() { console.error.apply(console, arguments); };
      this.warn = function() { console.warn.apply(console, arguments); };
      this.info = function() { console.info.apply(console, arguments); };
      return this;
    };
    
    // --- Safe Console Methods ---
    
    // Create safe console methods
    var safeConsoleMethods = {
      log: function() { var c = window.console; if (c && c.log) { c.log.apply(c, arguments); } },
      error: function() { var c = window.console; if (c && c.error) { c.error.apply(c, arguments); } },
      warn: function() { var c = window.console; if (c && c.warn) { c.warn.apply(c, arguments); } },
      info: function() { var c = window.console; if (c && c.info) { c.info.apply(c, arguments); } },
      debug: function() { var c = window.console; if (c && c.debug) { c.debug.apply(c, arguments); } },
      trace: function() { var c = window.console; if (c && c.trace) { c.trace.apply(c, arguments); } },
      dir: function() { var c = window.console; if (c && c.dir) { c.dir.apply(c, arguments); } },
      table: function() { var c = window.console; if (c && c.table) { c.table.apply(c, arguments); } },
      group: function() { var c = window.console; if (c && c.group) { c.group.apply(c, arguments); } },
      groupCollapsed: function() { var c = window.console; if (c && c.groupCollapsed) { c.groupCollapsed.apply(c, arguments); } },
      groupEnd: function() { var c = window.console; if (c && c.groupEnd) { c.groupEnd.apply(c, arguments); } },
      time: function() { var c = window.console; if (c && c.time) { c.time.apply(c, arguments); } },
      timeEnd: function() { var c = window.console; if (c && c.timeEnd) { c.timeEnd.apply(c, arguments); } },
      timeLog: function() { var c = window.console; if (c && c.timeLog) { c.timeLog.apply(c, arguments); } },
      clear: function() { var c = window.console; if (c && c.clear) { c.clear.apply(c, arguments); } },
      count: function() { var c = window.console; if (c && c.count) { c.count.apply(c, arguments); } },
      countReset: function() { var c = window.console; if (c && c.countReset) { c.countReset.apply(c, arguments); } },
      assert: function() { var c = window.console; if (c && c.assert) { c.assert.apply(c, arguments); } }
    };
    
    // Ensure there's a console object
    if (!window.console) {
      window.console = {};
    }
    
    // Apply safe methods to console
    for (var method in safeConsoleMethods) {
      if (safeConsoleMethods.hasOwnProperty(method) && 
          (!window.console[method] || typeof window.console[method] !== 'function')) {
        window.console[method] = safeConsoleMethods[method];
      }
    }
    
    // --- Require Interception ---
    
    // Intercept require calls for console-browserify
    window.__interceptedRequests = {
      console: 0,
      'console-browserify': 0
    };
    
    var originalRequire = window.require;
    if (typeof originalRequire === 'function') {
      window.require = function(moduleName) {
        // Handle console module requests
        if (moduleName === 'console-browserify' || moduleName === 'console') {
          window.__interceptedRequests[moduleName] = (window.__interceptedRequests[moduleName] || 0) + 1;
          console.warn('[pre-entry.js] Intercepted require("' + moduleName + '")');
          return fakeConsoleModule; // Return our fake module with Console constructor
        }
        
        // All other require calls pass through
        try {
          return originalRequire.apply(this, arguments);
        } catch (e) {
          console.error('[pre-entry.js] Error in require: ', e);
          return null;
        }
      };
    }
    
    // --- Message to verify loading ---
    console.log('[pre-entry.js] Console protection initialized successfully');
    console.log('[pre-entry.js] Binance connector fix installed');
  } catch (e) {
    // Fallback for any errors
    console.error('[pre-entry.js] Error initializing Console protection:', e);
    window.Console = null; // Last resort
  }
})(); 