// Every server action and query returns this shape so callers handle failure explicitly.
export type Result<T> = { data: T; error: null } | { data: null; error: string };

export function ok<T>(data: T): Result<T> {
    return { data, error: null };
}

export function fail<T = never>(error: string): Result<T> {
    return { data: null, error };
}
