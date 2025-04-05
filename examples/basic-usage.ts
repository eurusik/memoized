import { memoized, clearAllMemoized } from '../src';

// Example class with memoized methods and getters
class Calculator {
  private computeCount = 0;
  private getterCount = 0;
  
  // Memoized method - will only calculate once for the same arguments
  @memoized
  add(a: number, b: number): number {
    this.computeCount++;
    console.log(`Computing add(${a}, ${b})...`);
    return a + b;
  }
  
  // Memoized method with object arguments
  @memoized
  processObject(obj: Record<string, any>): string {
    this.computeCount++;
    console.log(`Processing object: ${JSON.stringify(obj)}`);
    return JSON.stringify(obj);
  }
  
  // Memoized getter - will only calculate once
  @memoized
  get expensiveValue(): number {
    this.getterCount++;
    console.log('Computing expensive value...');
    // Simulate expensive computation
    return 42;
  }
  
  // Get stats
  getStats(): { computeCount: number; getterCount: number } {
    return {
      computeCount: this.computeCount,
      getterCount: this.getterCount
    };
  }
}

// Create an instance
const calc = new Calculator();

// First call - will compute
console.log('First call with (1, 2):');
console.log(`Result: ${calc.add(1, 2)}`);

// Second call with same arguments - will use cache
console.log('\nSecond call with same arguments (1, 2):');
console.log(`Result: ${calc.add(1, 2)}`);

// Call with different arguments - will compute again
console.log('\nCall with different arguments (3, 4):');
console.log(`Result: ${calc.add(3, 4)}`);

// First access to getter - will compute
console.log('\nFirst access to getter:');
console.log(`Value: ${calc.expensiveValue}`);

// Second access to getter - will use cache
console.log('\nSecond access to getter:');
console.log(`Value: ${calc.expensiveValue}`);

// Object comparison demonstration
const obj1 = { name: 'John', age: 30 };
const obj2 = { name: 'John', age: 30 }; // Same structure but different object

console.log('\nFirst call with object:');
calc.processObject(obj1);

console.log('\nSecond call with equivalent object:');
calc.processObject(obj2);

// Clear specific method cache
console.log('\nClearing add method cache...');
(calc.add as any).clearMemo();
console.log('Call add(1, 2) after clearing cache:');
console.log(`Result: ${calc.add(1, 2)}`);

// Show stats
console.log('\nStats:', calc.getStats());

// Clear all memoized methods
console.log('\nClearing all memoized methods...');
clearAllMemoized(calc as any);

// Methods will compute again
console.log('\nCall add(1, 2) after clearing all caches:');
console.log(`Result: ${calc.add(1, 2)}`);

console.log('\nAccess expensiveValue after clearing all caches:');
console.log(`Value: ${calc.expensiveValue}`);

// Final stats
console.log('\nFinal stats:', calc.getStats());
