/**
 * Example demonstrating time-based caching with @memoizedTTL decorator
 * 
 * This example shows how to use the memoizedTTL decorator to cache API calls
 * with different expiration times.
 */

import { memoizedTTL, WithMemoizedMethods } from '../src';

/**
 * Simple API client with time-based caching
 */
class ApiClient implements WithMemoizedMethods {
  __memoizedClearFns?: Record<string, () => void>;
  
  /**
   * Fetch user data with 5-second cache
   * Results will be cached for 5 seconds before making a new request
   */
  @memoizedTTL(5000)
  async fetchUserData(userId: string): Promise<any> {
    console.log(`[${new Date().toISOString()}] Fetching user data for ${userId}...`);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * Fetch product data with 10-second cache
   * Results will be cached for 10 seconds before making a new request
   */
  @memoizedTTL(10000)
  async fetchProductData(productId: string): Promise<any> {
    console.log(`[${new Date().toISOString()}] Fetching product data for ${productId}...`);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return {
      id: productId,
      name: `Product ${productId}`,
      price: Math.floor(Math.random() * 100) + 1,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Run the example
 */
async function runExample() {
  const api = new ApiClient();
  
  console.log('=== Time-based caching example ===');
  console.log('This example demonstrates how @memoizedTTL works with different cache durations');
  
  // First user data fetch
  console.log('\n1. First fetch for user "123"');
  const userData1 = await api.fetchUserData('123');
  console.log('Result:', userData1);
  
  // Second user data fetch (should use cache)
  console.log('\n2. Second fetch for user "123" (should use cache)');
  const userData2 = await api.fetchUserData('123');
  console.log('Result:', userData2);
  console.log('Same result object?', userData1 === userData2);
  
  // First product data fetch
  console.log('\n3. First fetch for product "456"');
  const productData1 = await api.fetchProductData('456');
  console.log('Result:', productData1);
  
  // Wait 6 seconds - user data cache should expire, product cache still valid
  console.log('\n4. Waiting 6 seconds...');
  await new Promise(resolve => setTimeout(resolve, 6000));
  
  // Fetch user data again (cache should be expired)
  console.log('\n5. Fetch user "123" again after 6s (cache should be expired)');
  const userData3 = await api.fetchUserData('123');
  console.log('Result:', userData3);
  console.log('Same result object?', userData1 === userData3);
  
  // Fetch product data again (cache should still be valid)
  console.log('\n6. Fetch product "456" again after 6s (cache should still be valid)');
  const productData2 = await api.fetchProductData('456');
  console.log('Result:', productData2);
  console.log('Same result object?', productData1 === productData2);
  
  // Wait another 5 seconds - product data cache should expire now
  console.log('\n7. Waiting another 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Fetch product data again (cache should be expired)
  console.log('\n8. Fetch product "456" again after 11s total (cache should be expired)');
  const productData3 = await api.fetchProductData('456');
  console.log('Result:', productData3);
  console.log('Same result object?', productData1 === productData3);
}

// Run the example
runExample().catch(console.error);
