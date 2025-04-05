import { memoized, deepEqual, clearAllMemoized, WithMemoizedMethods } from '../src';

describe('deepEqual function', () => {
  test('primitives comparison', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('test', 'test')).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('test', 'other')).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  test('array comparison', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(deepEqual([], [])).toBe(true);
  });

  test('object comparison', () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(deepEqual({}, {})).toBe(true);
  });

  test('nested structures comparison', () => {
    expect(deepEqual({ a: [1, 2], b: { c: 3 } }, { a: [1, 2], b: { c: 3 } })).toBe(true);
    expect(deepEqual({ a: [1, 2], b: { c: 3 } }, { a: [1, 2], b: { c: 4 } })).toBe(false);
  });

  test('date comparison', () => {
    const date1 = new Date('2023-01-01');
    const date2 = new Date('2023-01-01');
    const date3 = new Date('2023-01-02');
    
    expect(deepEqual(date1, date2)).toBe(true);
    expect(deepEqual(date1, date3)).toBe(false);
  });

  test('map comparison', () => {
    const map1 = new Map([['a', 1], ['b', 2]]);
    const map2 = new Map([['a', 1], ['b', 2]]);
    const map3 = new Map([['a', 1], ['b', 3]]);
    
    expect(deepEqual(map1, map2)).toBe(true);
    expect(deepEqual(map1, map3)).toBe(false);
  });

  test('set comparison', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([1, 2, 3]);
    const set3 = new Set([1, 2, 4]);
    
    expect(deepEqual(set1, set2)).toBe(true);
    expect(deepEqual(set1, set3)).toBe(false);
  });
});

describe('memoized decorator', () => {
  // Test with legacy decorator syntax
  test('memoizes method calls with legacy decorator', () => {
    let computeCount = 0;
    
    class Calculator {
      @memoized
      add(a: number, b: number): number {
        computeCount++;
        return a + b;
      }
    }
    
    const calc = new Calculator();
    
    // First call should compute
    expect(calc.add(1, 2)).toBe(3);
    expect(computeCount).toBe(1);
    
    // Second call with same args should use cache
    expect(calc.add(1, 2)).toBe(3);
    expect(computeCount).toBe(1);
    
    // Call with different args should compute
    expect(calc.add(2, 3)).toBe(5);
    expect(computeCount).toBe(2);
    
    // Clear cache and call again
    (calc.add as any).clearMemo();
    expect(calc.add(1, 2)).toBe(3);
    expect(computeCount).toBe(3);
  });
  
  test('memoizes getters with legacy decorator', () => {
    let computeCount = 0;
    
    class Data {
      private _value: number;
      
      constructor(value: number) {
        this._value = value;
      }
      
      @memoized
      get expensiveComputation(): number {
        computeCount++;
        return this._value * 2;
      }
    }
    
    const data = new Data(5);
    
    // First access should compute
    expect(data.expensiveComputation).toBe(10);
    expect(computeCount).toBe(1);
    
    // Second access should use cached value
    expect(data.expensiveComputation).toBe(10);
    expect(computeCount).toBe(1);
  });

  test('clearAllMemoized clears all memoized methods', () => {
    let count1 = 0;
    let count2 = 0;
    
    class MultiCalc implements WithMemoizedMethods {
      __memoizedClearFns?: Record<string, () => void>;
      
      @memoized
      method1(a: number): number {
        count1++;
        return a * 2;
      }
      
      @memoized
      method2(b: number): number {
        count2++;
        return b * 3;
      }
    }
    
    const calc = new MultiCalc();
    
    // Call both methods
    expect(calc.method1(5)).toBe(10);
    expect(calc.method2(5)).toBe(15);
    expect(count1).toBe(1);
    expect(count2).toBe(1);
    
    // Call again - should use cache
    expect(calc.method1(5)).toBe(10);
    expect(calc.method2(5)).toBe(15);
    expect(count1).toBe(1);
    expect(count2).toBe(1);
    
    // Clear all memoized methods
    clearAllMemoized(calc);
    
    // Call again - should recompute
    expect(calc.method1(5)).toBe(10);
    expect(calc.method2(5)).toBe(15);
    expect(count1).toBe(2);
    expect(count2).toBe(2);
  });

  test('handles complex objects as arguments', () => {
    let computeCount = 0;
    
    class ObjectProcessor {
      @memoized
      process(obj: Record<string, any>): string {
        computeCount++;
        return JSON.stringify(obj);
      }
    }
    
    const processor = new ObjectProcessor();
    const obj1 = { a: 1, b: { c: [1, 2, 3] } };
    const obj2 = { a: 1, b: { c: [1, 2, 3] } }; // Same structure but different object
    
    // First call should compute
    processor.process(obj1);
    expect(computeCount).toBe(1);
    
    // Second call with equivalent object should use cache
    processor.process(obj2);
    expect(computeCount).toBe(1);
    
    // Modified object should cause recomputation
    processor.process({ ...obj1, d: 4 });
    expect(computeCount).toBe(2);
  });
});
