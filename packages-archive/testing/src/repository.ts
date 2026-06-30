export type DeferredRepositoryCall<TArgs extends unknown[] = unknown[], TResult = unknown> = {
  args: TArgs;
  result?: TResult;
};

export function createRepositoryCallLog<TMethods extends string>(methods: readonly TMethods[]) {
  const calls = Object.fromEntries(methods.map((method) => [method, []])) as unknown as Record<
    TMethods,
    Array<DeferredRepositoryCall>
  >;

  return {
    calls,
    record<TResult>(method: TMethods, args: unknown[], result?: TResult) {
      calls[method].push({ args, result });
      return result as TResult;
    },
    reset() {
      for (const method of methods) {
        calls[method] = [];
      }
    },
  };
}

export function createAsyncRepositoryMethod<TResult>(
  result: TResult,
  onCall?: (args: unknown[]) => void,
) {
  return async (...args: unknown[]) => {
    onCall?.(args);
    return result;
  };
}
