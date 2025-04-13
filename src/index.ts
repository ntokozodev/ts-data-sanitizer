function isEmptyObject(value: any): boolean {
  return typeof value === 'object' && 
         value !== null && 
         !(value instanceof Date) && 
         Object.keys(value).length === 0;
}

export function isFunction<T>(x: T): boolean {
  return x instanceof Function || typeof x === 'function';
}

function isEmptyValue(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && !value.trim().length) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (isEmptyObject(value)) return true;
  if (isFunction(value)) return true;
  return false;
}

/**
 * Sanitizes data by removing empty values and ensuring the result is a pure JavaScript object.
 * Removes:
 * - null and undefined values
 * - empty strings (or strings with only whitespace)
 * - empty objects (objects with only empty values)
 * - functions
 * 
 * Arrays and Date objects are preserved.
 * 
 * @param data The data to sanitize
 * @returns A pure JavaScript object with empty values removed.
 */
export function sanitizeData<T, U = T>(data: T): U {
  // Handle null/undefined input
  if (data === null || data === undefined) {
    return {} as U;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data as unknown as U;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    const sanitizedArray = data
      .map(item => {
        if (isEmptyValue(item)) return null;
        return sanitizeData(item);
      })
      .filter(item => !isEmptyValue(item));

    return sanitizedArray as unknown as U;
  }

  // Handle non-object values
  if (typeof data !== 'object') {
    return data as unknown as U;
  }

  const clone = Object.assign({}, data) as Record<string, any>;

  // Process each property
  for (const key in clone) {
    const value = clone[key];

    if (isEmptyValue(value)) {
      delete clone[key];
      continue;
    }

    if (Array.isArray(value)) {
      const sanitizedArray = sanitizeData(value);
      if ((sanitizedArray as any[]).length === 0) {
        delete clone[key];
      } else {
        clone[key] = sanitizedArray;
      }
    } else if (typeof value === 'object') {
      const sanitizedValue = sanitizeData(value);
      if (isEmptyObject(sanitizedValue)) {
        delete clone[key];
      } else {
        clone[key] = sanitizedValue;
      }
    }
  }

  return clone as U;
} 