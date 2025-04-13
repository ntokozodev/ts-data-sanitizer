import { sanitizeData, isFunction } from './index';

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

describe('isFunction', () => {
  it('should identify function declarations', () => {
    function test() {}
    expect(isFunction(test)).toBe(true);
  });

  it('should identify arrow functions', () => {
    const test = () => {};
    expect(isFunction(test)).toBe(true);
  });

  it('should identify function expressions', () => {
    const test = function() {};
    expect(isFunction(test)).toBe(true);
  });

  it('should identify class methods', () => {
    class Test {
      method() {}
    }
    const test = new Test();
    expect(isFunction(test.method)).toBe(true);
  });

  it('should not identify non-functions', () => {
    expect(isFunction(null)).toBe(false);
    expect(isFunction(undefined)).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction('function')).toBe(false);
  });
}); 