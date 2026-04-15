/**
 * Ultra-minimal patch for Console constructor issue
 * Just defines a global variable for binance to use
 */
(function() {
  // Define a simple global variable that won't cause assignment errors
  window.ConsoleFix = {
    // Create a simple constructor that works in browsers
    Console: function(options) {
      // Very minimal implementation
      this.log = function(msg) { console.log(msg); };
      this.error = function(msg) { console.error(msg); };
      this.warn = function(msg) { console.warn(msg); };
      this.info = function(msg) { console.info(msg); };
      return this;
    }
  };
  
  // Log successful initialization
  console.log('[binance-patch] Minimal patch applied');
})(); 