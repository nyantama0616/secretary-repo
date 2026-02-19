import type { CombinedDataTransformer } from '@trpc/server/unstable-core-do-not-import';

const serialize = (value: unknown): unknown => {
  if (value instanceof Date) {
    return { __type: 'Date', value: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return value.map(serialize);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serialize(val);
    }
    return result;
  }
  return value;
};

const deserialize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(deserialize);
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record.__type === 'Date' && typeof record.value === 'string') {
      return new Date(record.value);
    }
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) {
      result[key] = deserialize(val);
    }
    return result;
  }
  return value;
};

export const dateTransformer: CombinedDataTransformer = {
  input: { serialize, deserialize },
  output: { serialize, deserialize },
};
