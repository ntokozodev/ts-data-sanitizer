# ts-data-sanitizer

A TypeScript utility for sanitizing data by removing empty values, functions, and nulls.

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
    empty: ''
  }
};

const sanitized = sanitizeData(data);
// Result:
// {
//   name: 'John',
//   nested: {}
// }

// Example 2: With arrays
const dataWithArrays = {
  items: [
    { id: 1, value: null },
    { id: 2, value: '' }
  ]
};

const sanitizedArrays = sanitizeData(dataWithArrays);
// Result:
// {
//   items: [
//     { id: 1 },
//     { id: 2 }
//   ]
// }
```

## Features

- Removes `null` and `undefined` values
- Removes empty strings
- Removes empty objects
- Removes functions
- Handles nested objects and arrays
- Preserves TypeScript types
- Zero dependencies

## API

### `sanitizeData<T, U = T>(data: T): U`

Sanitizes the input data by removing empty values, functions, and nulls.

#### Parameters

- `data: T` - The data to sanitize

#### Returns

- `U` - The sanitized data (defaults to type T if U is not specified)

## License

MIT 