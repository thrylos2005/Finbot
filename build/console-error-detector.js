/**
 * Enhanced Console Error Detector 
 * - Tracks Console constructor access
 * - Monitors module loading
 * - Collects environment information
 */

(function() {
  // Create diagnostic info container
  window.__diagnostics = {
    consoleErrors: [],
    requireAttempts: {},
    browserInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      timestamp: new Date().toISOString()
    },
    loadedScripts: [],
    environmentChecks: {}
  };
  
  // --- Console Constructor Protection ---
  
  // Set a comprehensive trap for Console access
  try {
    if (window.Console !== null && window.Console !== undefined) {
      console.warn('Console constructor still exists when console-error-detector loaded!');
      window.__diagnostics.environmentChecks.consoleExistsAtDetectorLoad = true;
      
      // Try to force removal again
      delete window.Console;
      
      Object.defineProperty(window, 'Console', {
        configurable: true,
        get: function() {
          var error = new Error('Console constructor access attempt');
          var stack = error.stack || '';
          
          // Record detailed error info
          window.__diagnostics.consoleErrors.push({
            timestamp: new Date().toISOString(),
            stack: stack,
            source: 'console-error-detector.js getter'
          });
          
          console.error('[console-error-detector] Console constructor access attempted:', stack);
          return null;
        },
        set: function(value) {
          window.__diagnostics.consoleErrors.push({
            timestamp: new Date().toISOString(),
            attemptedValue: String(value),
            source: 'console-error-detector.js setter'
          });
          console.error('[console-error-detector] Attempt to set Console constructor');
          return;
        }
      });
    } else {
      window.__diagnostics.environmentChecks.consoleRemovedBeforeDetector = true;
    }
  } catch (e) {
    console.error('[console-error-detector] Error setting up Console protection:', e);
    window.__diagnostics.environmentChecks.consoleProtectionError = e.message;
  }
  
  // --- Track loaded scripts ---
  
  // Monitor script loading to identify potential sources of issues
  try {
    var originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      var element = originalCreateElement.apply(document, arguments);
      if (tagName.toLowerCase() === 'script') {
        element.addEventListener('load', function() {
          if (element.src) {
            window.__diagnostics.loadedScripts.push({
              src: element.src,
              timestamp: new Date().toISOString()
            });
          }
        });
      }
      return element;
    };
  } catch (e) {
    console.error('[console-error-detector] Error setting up script tracking:', e);
  }
  
  // --- Enhanced error reporting ---
  
  // Global error handler
  window.addEventListener('error', function(event) {
    // Check specifically for Console constructor errors
    if (event && event.error && event.error.message && 
        event.error.message.indexOf('Console is not a constructor') !== -1) {
      
      window.__diagnostics.consoleErrors.push({
        timestamp: new Date().toISOString(),
        message: event.error.message,
        source: event.filename || 'unknown',
        line: event.lineno,
        column: event.colno,
        stack: event.error.stack,
        type: 'global error event'
      });
      
      console.error('[console-error-detector] Caught Console constructor error:', event.error);
    }
  }, true);
  
  // --- Diagnostic helpers ---
  
  // Enhanced function to display errors
  window.showConsoleErrors = function() {
    const errorReport = document.createElement('div');
    errorReport.style.padding = '20px';
    errorReport.style.margin = '20px auto';
    errorReport.style.maxWidth = '800px';
    errorReport.style.border = '2px solid red';
    errorReport.style.backgroundColor = '#fff';
    errorReport.style.color = '#333';
    errorReport.style.fontFamily = 'monospace';
    errorReport.style.fontSize = '14px';
    errorReport.style.position = 'relative';
    errorReport.style.zIndex = '10000';
    errorReport.style.maxHeight = '80vh';
    errorReport.style.overflow = 'auto';
    errorReport.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '10px';
    closeButton.style.top = '10px';
    closeButton.style.background = '#f44336';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = function() {
      document.body.removeChild(errorReport);
    };
    errorReport.appendChild(closeButton);
    
    // Title
    const heading = document.createElement('h2');
    heading.textContent = 'JavaScript Error Diagnostic Report';
    heading.style.borderBottom = '1px solid #ccc';
    heading.style.paddingBottom = '10px';
    heading.style.marginBottom = '20px';
    errorReport.appendChild(heading);
    
    // Browser information
    const browserSection = document.createElement('div');
    browserSection.innerHTML = '<h3>Browser Information</h3>' +
      '<p><strong>User Agent:</strong> ' + window.__diagnostics.browserInfo.userAgent + '</p>' +
      '<p><strong>Platform:</strong> ' + window.__diagnostics.browserInfo.platform + '</p>' +
      '<p><strong>Language:</strong> ' + window.__diagnostics.browserInfo.language + '</p>' +
      '<p><strong>Timestamp:</strong> ' + window.__diagnostics.browserInfo.timestamp + '</p>';
    errorReport.appendChild(browserSection);
    
    // Console errors section
    const errorsSection = document.createElement('div');
    errorsSection.innerHTML = '<h3>Console Constructor Errors</h3>';
    
    if (window.__diagnostics.consoleErrors.length === 0) {
      errorsSection.innerHTML += '<p>No Console constructor errors detected.</p>';
    } else {
      const list = document.createElement('ul');
      list.style.paddingLeft = '20px';
      
      window.__diagnostics.consoleErrors.forEach(function(error) {
        const item = document.createElement('li');
        item.style.marginBottom = '10px';
        
        let html = '<strong>Time:</strong> ' + error.timestamp + '<br>';
        
        if (error.message) {
          html += '<strong>Message:</strong> ' + error.message + '<br>';
        }
        
        if (error.source) {
          html += '<strong>Source:</strong> ' + error.source + '<br>';
        }
        
        if (error.line) {
          html += '<strong>Line:</strong> ' + error.line + ', <strong>Column:</strong> ' + error.column + '<br>';
        }
        
        if (error.stack) {
          html += '<strong>Stack:</strong><br><pre style="margin: 5px 0; padding: 10px; background: #f5f5f5; border: 1px solid #ddd; overflow: auto;">' + error.stack + '</pre>';
        }
        
        item.innerHTML = html;
        list.appendChild(item);
      });
      
      errorsSection.appendChild(list);
    }
    errorReport.appendChild(errorsSection);
    
    // Environment checks
    const envSection = document.createElement('div');
    envSection.innerHTML = '<h3>Environment Checks</h3>';
    let envHtml = '<ul>';
    for (let check in window.__diagnostics.environmentChecks) {
      envHtml += '<li><strong>' + check + ':</strong> ' + window.__diagnostics.environmentChecks[check] + '</li>';
    }
    envHtml += '</ul>';
    envSection.innerHTML += envHtml;
    errorReport.appendChild(envSection);
    
    // Add to document
    document.body.appendChild(errorReport);
    
    // Return data for console
    console.log('Diagnostic information:', window.__diagnostics);
    return window.__diagnostics;
  };
  
  // Log initialization
  console.log('[console-error-detector] Initialized');
})(); 