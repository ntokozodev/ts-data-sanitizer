import { sanitizeData } from './index';

describe('sanitizeData', () => {
  it('should remove null and undefined values', () => {
    const data = {
      name: 'John',
      age: null,
      email: undefined
    };
    const result = sanitizeData(data);
    expect(result).toEqual({ name: 'John' });
  });

  it('should remove empty strings', () => {
    const data = {
      name: 'John',
      email: '',
      phone: '   '
    };
    const result = sanitizeData(data);
    expect(result).toEqual({ name: 'John' });
  });

  it('should remove empty objects', () => {
    const data = {
      name: 'John',
      empty: {},
      nested: { empty: {} }
    };
    const result = sanitizeData(data);
    expect(result).toEqual({ name: 'John' });
  });

  it('should remove functions', () => {
    const data = {
      name: 'John',
      handler: () => {},
      method: function() {}
    };
    const result = sanitizeData(data);
    expect(result).toEqual({ name: 'John' });
  });

  it('should handle arrays', () => {
    const data = {
      items: [
        { id: 1, value: null },
        { id: 2, value: '' }
      ]
    };
    const result = sanitizeData(data);
    expect(result).toEqual({
      items: [
        { id: 1 },
        { id: 2 }
      ]
    });
  });

  it('should preserve non-empty values', () => {
    const data = {
      name: 'John',
      age: 30,
      active: true,
      tags: ['developer', 'typescript']
    };
    const result = sanitizeData(data);
    expect(result).toEqual(data);
  });

  // New test cases
  it('should handle deeply nested objects', () => {
    const data = {
      user: {
        profile: {
          details: {
            name: 'John',
            bio: '',
            social: {
              twitter: '',
              github: 'johndoe',
              linkedin: null
            }
          },
          settings: {}
        },
        preferences: {
          theme: 'dark',
          notifications: {
            email: false,
            push: {}
          }
        }
      }
    };
    const expected = {
      user: {
        profile: {
          details: {
            name: 'John',
            social: {
              github: 'johndoe'
            }
          },
        },
        preferences: {
          theme: 'dark',
          notifications: {
            email: false
          }
        }
      }
    };
    const result = sanitizeData(data);
    expect(result).toEqual(expected);
  });

  it('should handle arrays with mixed content', () => {
    const data = {
      mixed: [
        'valid',
        '',
        null,
        { name: 'John', age: null },
        {},
        [],
        [1, '', null, {}],
        () => {}
      ]
    };
    const expected = {
      mixed: [
        'valid',
        { name: 'John' },
        [1]
      ]
    };
    const result = sanitizeData(data);
    expect(result).toEqual(expected);
  });

  it('should handle Date objects', () => {
    const date = new Date();
    const data = {
      created: date,
      updated: null,
      nested: {
        timestamp: date
      }
    };
    const expected = {
      created: date,
      nested: {
        timestamp: date
      }
    };
    const result = sanitizeData(data);
    expect(result).toEqual(expected);
  });

  it('should handle zero values correctly', () => {
    const data = {
      count: 0,
      price: 0.0,
      empty: '',
      nested: {
        value: 0,
        null: null
      }
    };
    const expected = {
      count: 0,
      price: 0.0,
      nested: {
        value: 0
      }
    };
    const result = sanitizeData(data);
    expect(result).toEqual(expected);
  });

  it('should handle arrays with only empty values', () => {
    const data = {
      empty: ['', null, undefined],
      nested: [[], {}, null],
      mixed: [{ empty: '' }, { null: null }, { obj: {} }]
    };
    const result = sanitizeData(data);
    expect(result).toEqual({});
  });
});

describe('sanitizeData Performance Tests', () => {
  it('Performance: Large Nested Objects', () => {
    // Create a large nested object
    const largeObject: Record<string, any> = {};
    for (let i = 0; i < 1000; i++) {
      largeObject[`key${i}`] = {
        nested: {
          value: i % 2 === 0 ? null : i,
          array: Array(10).fill(i % 3 === 0 ? null : i),
          empty: i % 4 === 0 ? {} : { value: i }
        }
      };
    }

    const start = performance.now();
    const result = sanitizeData(largeObject);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    expect(Object.keys(result).length).toBeLessThan(1000); // Some objects should be removed
  });

  it('Performance: Large Arrays', () => {
    // Create a large array with mixed content
    const largeArray = Array(10000).fill(null).map((_, i) => ({
      id: i,
      value: i % 2 === 0 ? null : i,
      nested: i % 3 === 0 ? {} : { value: i },
      array: Array(5).fill(i % 4 === 0 ? null : i)
    }));

    const start = performance.now();
    const result = sanitizeData(largeArray);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    
    // Verify that unwanted values are removed
    result.forEach((item: any, index: number) => {
      // id should always be preserved
      expect(item.id).toBe(index);
      
      // value should not be null if it exists
      if (item.value !== undefined) {
        expect(item.value).not.toBeNull();
      }

      // nested should not be empty if it exists
      if (item.nested !== undefined) {
        expect(Object.keys(item.nested).length).toBeGreaterThan(0);
      }

      // array should not contain null values
      if (item.array !== undefined) {
        expect(item.array).not.toContain(null);
      }
    });
  });

  it('Performance: Mixed Data Types', () => {
    // Create an object with various data types
    const mixedData = {
      strings: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? '' : `value${i}`),
      numbers: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? null : i),
      booleans: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? null : i % 2 === 0),
      dates: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? null : new Date()),
      objects: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? {} : { value: i }),
      arrays: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? [] : [i, i + 1, i + 2])
    };

    const start = performance.now();
    const result = sanitizeData(mixedData);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    expect(Object.keys(result).length).toBe(6); // All top-level keys should be preserved
  });

  it('Performance: Repeated Operations', () => {
    const data = {
      value: 42,
      nested: {
        empty: {},
        array: [null, 1, null, 2],
        object: { a: null, b: 1 }
      }
    };

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      sanitizeData(data);
    }
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000); // 1000 operations should complete within 1 second
  });
}); 