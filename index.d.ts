import type { Store, StoreValue } from 'nanostores'

type StoreKeys<T> = T extends { setKey: (k: infer K, v: any) => unknown }
  ? K
  : never

export interface UseStoreOptions<SomeStore> {
  /**
   * Re-evaluate the value only on specific key changes.
   */
  keys?: StoreKeys<SomeStore>[]
}

/**
 * Subscribe to store changes and get the store’s value as a reactive holder.
 *
 * Read `.current` inside a reactive context (markup, `$derived`, or `$effect`)
 * to subscribe to changes. Reading it outside of one — for example during
 * server-side rendering — simply returns the current value without subscribing.
 *
 * ```svelte
 * <script>
 *   import { useStore } from 'nanostores-svelte-runes'
 *
 *   import { profile } from '../stores/profile.js'
 *
 *   let user = useStore(profile)
 * </script>
 *
 * <header>Hi, {user.current.name}</header>
 * ```
 *
 * @param store Store instance.
 * @returns Reactive holder with the store’s value in `current`.
 */
export function useStore<SomeStore extends Store>(
  store: SomeStore,
  options?: UseStoreOptions<SomeStore>
): { readonly current: StoreValue<SomeStore> }
