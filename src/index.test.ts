import { describe, it, expect } from 'vitest';
import { sanitizeData } from './index';

describe('sanitizeData', () => {
  it('should remove null and undefined values', () => {
    // Arrange
    const data = {
      name: 'John',
      age: null,
      email: undefined
    };

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual({ name: 'John' });
  });

  it('should remove empty strings', () => {
    // Arrange
    const data = {
      name: 'John',
      email: '',
      phone: '   '
    };

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual({ name: 'John' });
  });

  it('should remove empty objects', () => {
    // Arrange
    const data = {
      name: 'John',
      empty: {},
      nested: { empty: {} }
    };

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual({ name: 'John' });
  });

  it('should remove functions', () => {
    // Arrange
    const data = {
      name: 'John',
      handler: () => {},
      method: function() {}
    };

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual({ name: 'John' });
  });

  it('should handle arrays', () => {
    // Arrange
    const data = {
      items: [
        { id: 1, value: null },
        { id: 2, value: '' }
      ]
    };

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual({
      items: [
        { id: 1 },
        { id: 2 }
      ]
    });
  });

  it('should preserve non-empty values', () => {
    // Arrange
    const data = {
      name: 'John',
      age: 30,
      active: true,
      tags: ['developer', 'typescript']
    };

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual(data);
  });

  it('should handle deeply nested objects', () => {
    // Arrange
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

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual(expected);
  });

  it('should handle arrays with mixed content', () => {
    // Arrange
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

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual(expected);
  });

  it('should handle Date objects', () => {
    // Arrange
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

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual(expected);
  });

  it('should handle zero values correctly', () => {
    // Arrange
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

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual(expected);
  });

  it('should handle arrays with only empty values', () => {
    // Arrange
    const data = {
      empty: ['', null, undefined],
      nested: [[], {}, null],
      mixed: [{ empty: '' }, { null: null }, { obj: {} }]
    };

    // Act
    const result = sanitizeData(data);

    // Assert
    expect(result).toEqual({});
  });
});

describe('performance tests: sanitizeData', () => {
  it('performance: large nested objects', () => {
    // Arrange
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

    // Act
    const start = performance.now();
    const result = sanitizeData(largeObject);
    const duration = performance.now() - start;

    // Assert
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    expect(Object.keys(result).length).toBeLessThan(1000); // Some objects should be removed
  });

  it('performance: large arrays', () => {
    // Arrange
    const largeArray = Array(10000).fill(null).map((_, i) => ({
      id: i,
      value: i % 2 === 0 ? null : i,
      nested: i % 3 === 0 ? {} : { value: i },
      array: Array(5).fill(i % 4 === 0 ? null : i)
    }));

    // Act
    const start = performance.now();
    const result = sanitizeData(largeArray);
    const duration = performance.now() - start;

    // Assert
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

  it('performance: mixed data types', () => {
    // Arrange
    const mixedData = {
      strings: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? '' : `value${i}`),
      numbers: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? null : i),
      booleans: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? null : i % 2 === 0),
      dates: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? null : new Date()),
      objects: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? {} : { value: i }),
      arrays: Array(1000).fill(null).map((_, i) => i % 2 === 0 ? [] : [i, i + 1, i + 2])
    };

    // Act
    const start = performance.now();
    const result = sanitizeData(mixedData);
    const duration = performance.now() - start;

    // Assert
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    expect(Object.keys(result).length).toBe(6); // All top-level keys should be preserved
  });

  it('performance: repeated operations', () => {
    // Arrange
    const data = {
      value: 42,
      nested: {
        empty: {},
        array: [null, 1, null, 2],
        object: { a: null, b: 1 }
      }
    };

    // Act
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      sanitizeData(data);
    }
    const duration = performance.now() - start;

    // Assert
    expect(duration).toBeLessThan(1000); // 1000 operations should complete within 1 second
  });
}); 