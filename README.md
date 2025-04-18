# ts-data-sanitizer

A TypeScript utility for sanitizing data by removing empty values, functions, and nulls, returning a plain JavaScript object.

## Installation

```bash
npm install ts-data-sanitizer
```

## Usage

```typescript
import { sanitizeData } from 'ts-data-sanitizer';

// Example 1: Basic usage
const data = {
  name: 'John',
  age: null,
  email: '',
  address: undefined,
  emptyObject: {},
  nested: {
    value: null,
    empty: '',
    emptyObject: {},
    date: new Date()
  }
};

const sanitized = sanitizeData(data);
// Result:
// {
//   name: 'John',
//   nested: {
//     date: Date
//   }
// }

// Example 2: With arrays
const dataWithArrays = {
  items: [
    { id: 1, value: null },
    { id: 2, value: '' },
    { id: 3, value: {} },
    { id: 4, value: 'valid' }
  ],
  emptyArray: []
};

const sanitizedArrays = sanitizeData(dataWithArrays);
// Result:
// {
//   items: [
//     { id: 1 },
//     { id: 2 },
//     { id: 3 },
//     { id: 4, value: 'valid' }
//   ],
//   emptyArray: []
// }
```

## Features

- Returns a plain JavaScript object
- Removes `null` and `undefined` values
- Removes empty strings
- Removes empty objects (objects with no properties)
- Removes functions
- Preserves Date objects
- Preserves empty arrays
- Handles nested objects and arrays
- Zero dependencies

## API

### `sanitizeData<T, U = T>(data: T): U`

Sanitizes the input data by removing empty values, functions, and nulls, returning a plain JavaScript object.

#### Parameters

- `data: T` - The data to sanitize

#### Returns

- `U` - A plain JavaScript object with empty values removed (defaults to type T if U is not specified)

## License

MIT 