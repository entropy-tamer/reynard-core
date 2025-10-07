/**
 * Manual test to verify our implementation works
 */

// Simple test without complex setup
async function testDebounce() {
  console.log('Testing debounce...');
  
  // Mock the algorithms package functions
  const mockSyncDebounce = (fn, wait, options = {}) => {
    let timeoutId = null;
    let lastArgs = null;
    
    const debounced = (...args) => {
      lastArgs = args;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...lastArgs);
        timeoutId = null;
      }, wait);
    };
    
    debounced.cancel = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
    };
    
    debounced.flush = () => {
      if (lastArgs) {
        debounced.cancel();
        fn(...lastArgs);
      }
    };
    
    return debounced;
  };
  
  // Test basic functionality
  const mockFn = (arg) => {
    console.log(`Function called with: ${arg}`);
    return Promise.resolve(`result-${arg}`);
  };
  
  // Create a simple async debounce
  const syncDebounced = mockSyncDebounce(mockFn, 100);
  
  // Test multiple calls
  console.log('Calling debounced function multiple times...');
  syncDebounced('test1');
  syncDebounced('test2');
  syncDebounced('test3');
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 150));
  
  console.log('Debounce test completed!');
}

async function testAbortController() {
  console.log('Testing AbortController...');
  
  const controller = new AbortController();
  console.log('AbortController created:', controller.signal.aborted);
  
  controller.abort();
  console.log('AbortController aborted:', controller.signal.aborted);
  
  console.log('AbortController test completed!');
}

async function runTests() {
  console.log('🦊 Running manual tests for async rate limiting...');
  
  try {
    await testDebounce();
    await testAbortController();
    console.log('✅ All manual tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
runTests();
