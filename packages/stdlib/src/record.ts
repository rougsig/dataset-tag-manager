export const recordKeys = <K extends PropertyKey, T>(object: Record<K, T>) => (Object.keys(object) as (K)[])

export const recordEntries = <K extends PropertyKey, T>(object: Record<K, T>) => (Object.entries(object) as ([K, T])[])

export const recordValues = <K extends PropertyKey, T>(object: Record<K, T>) => (Object.values(object) as T[])
