/**
 * Test importing our rate limiting module
 */

console.log('🦊 Testing import of rate limiting module...');

try {
  // Try to import our module
  import('../rate-limiting.ts').then(({ createAbortController }) => {
    console.log('✅ Successfully imported createAbortController');
    
    const controller = createAbortController();
    console.log('✅ Successfully created AbortController:', controller.signal.aborted);
  }).catch(error => {
    console.error('❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
  });
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
}
