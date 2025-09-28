

export function check<T extends never>() {}
export type TypeEqualityGuard<A,B> = Exclude<A,B> | Exclude<B,A>;
