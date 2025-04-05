/**
 * @memoized - Smart memoization decorator for TypeScript
 * A lightweight and flexible TypeScript decorator that memoizes method or getter results
 * using deep argument comparison.
 */

/**
 * Interface for objects with memoized methods
 */
export interface WithMemoizedMethods {
  __memoizedClearFns?: Record<string, () => void>;
}

/**
 * Deep equality comparison function
 * Compares two values recursively for equality
 * 
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param depth - Maximum recursion depth (default: 100)
 * @returns boolean indicating if values are deeply equal
 */
export function deepEqual(a: unknown, b: unknown, depth: number = 100): boolean {
    // Prevent stack overflow with circular references or very deep objects
    if (depth <= 0) return false;
    
    // Fast path for strict equality (handles primitives efficiently)
    if (a === b) return true;
    
    // Handle null/undefined cases
    if (a == null || b == null) return false;
    
    // Fast path for different types
    const typeA = typeof a;
    const typeB = typeof b;
    if (typeA !== typeB) return false;
    
    // Fast path for primitives - already checked with === above
    // This avoids unnecessary deep comparison for primitives
    if (typeA !== 'object' && typeA !== 'function') return false;

    // Handle special types
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    
    if (a instanceof RegExp && b instanceof RegExp) {
        return a.toString() === b.toString();
    }

    // At this point, we know both a and b are objects (or null, which was handled above)
    if (a && b) {
        // Handle arrays
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            
            // Fast path for primitive arrays - use direct comparison first
            const allPrimitives = a.every(item => 
                item === null || 
                item === undefined || 
                (typeof item !== 'object' && typeof item !== 'function')
            );
            
            if (allPrimitives) {
                // For primitive arrays, we can do a faster comparison
                return a.every((val, i) => val === b[i]);
            }
            
            // For arrays with objects, do deep comparison
            return a.every((val, i) => deepEqual(val, b[i], depth - 1));
        }

        // Handle Maps
        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size) return false;
            for (const [key, val] of a.entries()) {
                if (!b.has(key) || !deepEqual(val, b.get(key), depth - 1)) {
                    return false;
                }
            }
            return true;
        }

        // Handle Sets
        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size) return false;
            for (const item of a) {
                // For sets, we need to find an equal item
                if (![...b].some(bItem => deepEqual(item, bItem, depth - 1))) {
                    return false;
                }
            }
            return true;
        }

        // Handle plain objects
        if (!Array.isArray(a) && !Array.isArray(b) && 
            Object.getPrototypeOf(a) === Object.prototype && 
            Object.getPrototypeOf(b) === Object.prototype) {
            
            const keysA = Object.keys(a as object);
            const keysB = Object.keys(b as object);
            if (keysA.length !== keysB.length) return false;

            return keysA.every(key =>
                deepEqual(
                    (a as Record<string, unknown>)[key], 
                    (b as Record<string, unknown>)[key],
                    depth - 1
                ),
            );
        }

        // Handle custom objects with equals method
        if (typeof (a as any).equals === 'function') {
            return (a as any).equals(b);
        }

        return false;
    }

    return false;
}

/**
 * Creates a memoized version of a method
 * 
 * @param originalMethod - The original method to memoize
 * @param key - The property key of the method
 * @param instance - Optional instance to attach clearMemo function to
 * @returns A memoized version of the original method with a clearMemo function
 */
export function createMemoizedMethod(
    originalMethod: (...args: unknown[]) => unknown,
    key: string,
    instance?: WithMemoizedMethods,
): ((...args: unknown[]) => unknown) & { clearMemo: () => void } {
    let previousArgs: readonly unknown[] = [];
    let calledOnce = false;
    let cachedResult: unknown;

    const memoizedFn = function (this: any, ...args: unknown[]) {
        const isSame =
            calledOnce &&
            previousArgs.length === args.length &&
            args.every((arg, i) => deepEqual(arg, previousArgs[i]));

        if (isSame) {
            return cachedResult;
        }

        previousArgs = [...args]; // Create a copy to prevent mutation
        cachedResult = originalMethod.apply(this, args);
        calledOnce = true;

        return cachedResult;
    };

    memoizedFn.clearMemo = () => {
        previousArgs = [];
        cachedResult = undefined;
        calledOnce = false;
    };

    if (instance) {
        if (!instance.__memoizedClearFns) {
            instance.__memoizedClearFns = {};
        }

        instance.__memoizedClearFns[key] = memoizedFn.clearMemo;
    }

    return memoizedFn as ((...args: unknown[]) => unknown) & { clearMemo: () => void };
}

/**
 * Clears all memoized values on an instance
 * 
 * @param instance - Instance with memoized methods
 */
export function clearAllMemoized(instance: WithMemoizedMethods): void {
  if (instance.__memoizedClearFns) {
    Object.values(instance.__memoizedClearFns).forEach(clearFn => clearFn());
  }
}

/**
 * Memoization decorator for class methods and getters
 * Supports both legacy and stage 3 decorators
 * 
 * @example
 * // Legacy decorator
 * class Example {
 *   @memoized
 *   expensiveMethod(arg1: string, arg2: number) {
 *     // expensive calculation
 *     return result;
 *   }
 * 
 *   @memoized
 *   get expensiveComputation() {
 *     // expensive calculation
 *     return result;
 *   }
 * }
 * 
 * @example
 * // Stage 3 decorator
 * class Example {
 *   @memoized
 *   expensiveMethod(arg1: string, arg2: number) {
 *     // expensive calculation
 *     return result;
 *   }
 * 
 *   @memoized
 *   get expensiveComputation() {
 *     // expensive calculation
 *     return result;
 *   }
 * }
 */
export function memoized<T>(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
): TypedPropertyDescriptor<T>;

export function memoized<A extends unknown[], R>(
    target: (...args: A) => R,
    context: ClassGetterDecoratorContext | ClassMethodDecoratorContext,
): (...args: A) => R;

export function memoized(
    target: object | ((...args: unknown[]) => unknown),
    contextOrKey:
        | ClassGetterDecoratorContext
        | ClassMethodDecoratorContext
        | string,
    descriptor?: TypedPropertyDescriptor<any>,
): any {
    if (typeof target === 'function') {
        const context = contextOrKey as
            | ClassGetterDecoratorContext
            | ClassMethodDecoratorContext;

        if (context.kind === 'getter') {
            return function memoizedGetter(this: object): unknown {
                const value = (target as Function).call(this);

                Object.defineProperty(this, context.name, {
                    enumerable: true,
                    configurable: true,
                    value,
                });

                return value;
            };
        }

        if (context.kind === 'method') {
            return createMemoizedMethod(target as (...args: unknown[]) => unknown, context.name.toString());
        }

        throw new Error('memoized can only be used on methods or getters');
    }

    const propertyKey = contextOrKey as string;
    const {get, value} = descriptor!;

    if (get) {
        return {
            configurable: true,
            enumerable: true,
            get: function memoizedGetter(): unknown {
                const result = get.call(this);

                Object.defineProperty(this, propertyKey, {
                    configurable: true,
                    enumerable: true,
                    value: result,
                });

                return result;
            },
        };
    }

    if (typeof value !== 'function') {
        throw new Error('memoized can only be used on methods or getters');
    }

    return {
        configurable: true,
        enumerable: true,
        get(): unknown {
            const fn = createMemoizedMethod(value as (...args: unknown[]) => unknown, propertyKey, this);
            Object.defineProperty(this, propertyKey, {
                configurable: true,
                value: fn,
            });

            return fn;
        },
    };
}
