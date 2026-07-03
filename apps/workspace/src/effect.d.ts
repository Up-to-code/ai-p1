declare module "effect" {
  const Effect: any
  namespace Effect {
    type Effect<T, E = never, R = never> = any
  }
  const Cause: any
  const Exit: any
  const Option: any
  const Duration: any
  const RateLimiter: any
  namespace Cache {
    function make<K, V, E>(options: {
      capacity: number
      timeToLive: any
      lookup: (key: K) => any
    }): any
    type Cache<K, V, E> = any
  }
  export { Effect, Cause, Exit, Option, Cache, Duration, RateLimiter }
}
