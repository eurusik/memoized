# 🧠 @memoized

A lightweight and flexible TypeScript decorator that memoizes method or getter results using deep argument comparison.

## Features

- 🧩 **Versatile**: Supports both methods and getters
- 🔍 **Smart**: Uses deep comparison to detect identical arguments
- ⚡️ **Fast**: Optimized comparison with fast paths for primitives and arrays
- 🧼 **Clean**: Includes a built-in way to clear memoized cache
- ⚙️ **Compatible**: Works with both legacy and Stage 3 decorator syntax
- 🏃 **Performant**: Avoids unnecessary deep comparisons for primitive values
- ⏱️ **Time-based**: Supports automatic cache expiration with TTL (time-to-live)

Perfect for caching pure and expensive computations without relying on external libraries.

## Installation

```bash
npm install @eurusik/memoized
```

## Usage

### Basic Usage

```typescript
import { memoized } from '@eurusik/memoized';

class Calculator {
  @memoized
  expensiveCalculation(a: number, b: number): number {
    console.log('Computing...');
    // Simulate expensive operation
    return a + b;
  }
  
  @memoized
  get complexValue(): number {
    console.log('Computing getter...');
    // Simulate expensive computation
    return 42;
  }
}

const calc = new Calculator();

// First call - will log 'Computing...'
calc.expensiveCalculation(1, 2); // => 3

// Second call with same arguments - no log, uses cached result
calc.expensiveCalculation(1, 2); // => 3

// Different arguments - will compute again
calc.expensiveCalculation(3, 4); // => 7

// First access - will log 'Computing getter...'
calc.complexValue; // => 42

// Second access - no log, uses cached result
calc.complexValue; // => 42
```

### Clearing the Cache

```typescript
import { memoized, clearAllMemoized } from '@eurusik/memoized';

class DataProcessor {
  @memoized
  processData(data: any[]): any {
    console.log('Processing data...');
    return data.map(item => item * 2);
  }
  
  @memoized
  analyzeData(data: any[]): any {
    console.log('Analyzing data...');
    return data.reduce((sum, item) => sum + item, 0);
  }
}

const processor = new DataProcessor();

// Process data
processor.processData([1, 2, 3]); // Logs 'Processing data...'
processor.processData([1, 2, 3]); // Uses cache, no log

// Clear cache for a specific method
(processor.processData as any).clearMemo();
processor.processData([1, 2, 3]); // Logs 'Processing data...' again

// Clear all memoized methods on the instance
clearAllMemoized(processor);

// Both methods will recompute
processor.processData([1, 2, 3]); // Logs 'Processing data...'
processor.analyzeData([1, 2, 3]); // Logs 'Analyzing data...'
```

### Time-based Caching with TTL

```typescript
import { memoizedTTL } from '@eurusik/memoized';

class ApiClient {
  // Cache results for 5 seconds
  @memoizedTTL(5000)
  async fetchUserData(userId: string): Promise<any> {
    console.log(`Fetching data for user ${userId}...`);
    // Simulate API call
    const response = await fetch(`https://api.example.com/users/${userId}`);
    return response.json();
  }
  
  // Cache results for 1 minute
  @memoizedTTL(60000)
  async fetchProductData(productId: string): Promise<any> {
    console.log(`Fetching data for product ${productId}...`);
    // Simulate API call
    const response = await fetch(`https://api.example.com/products/${productId}`);
    return response.json();
  }
}

const api = new ApiClient();

// First call - will fetch data
await api.fetchUserData('123'); // Logs 'Fetching data for user 123...'

// Second call within 5 seconds - uses cached result
await api.fetchUserData('123'); // No log, uses cache

// After 5 seconds - cache expires and data is fetched again
// ... wait 5+ seconds ...
await api.fetchUserData('123'); // Logs 'Fetching data for user 123...' again
```

## API Reference

### `@memoized`

A decorator for class methods and getters that caches results based on deep comparison of arguments.

### `@memoizedTTL(ttl)`

A decorator that adds time-based expiration to cached results. The `ttl` parameter specifies the time-to-live in milliseconds.

### `clearAllMemoized(instance)`

Clears all memoized caches on a class instance.

### `deepEqual(a, b, depth?)`

Utility function for deep comparison of values.

## How It Works

The `@memoized` decorator works by:

1. Storing the arguments and result of the first call
2. On subsequent calls, comparing new arguments with stored ones using optimized equality checks:
   - Fast path for primitive values using `===`
   - Optimized comparison for arrays of primitives
   - Deep comparison only when necessary for objects and complex arrays
3. If arguments match, returning the cached result instead of recomputing
4. For getters, replacing the getter with the computed value after first access

The `@memoizedTTL` decorator works similarly but adds time-based expiration:

1. Stores the arguments, result, and timestamp of the first call
2. On subsequent calls, checks if the cache has expired based on the TTL
3. If the cache is valid (arguments match and TTL hasn't expired), returns the cached result
4. Otherwise, recomputes the result and updates the cache with a new timestamp

## License

MIT
