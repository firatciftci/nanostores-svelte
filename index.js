import { listenKeys } from 'nanostores'
import { createSubscriber } from 'svelte/reactivity'

export function useStore(store, { keys } = {}) {
  let subscribe = createSubscriber(update => {
    return keys?.length > 0
      ? listenKeys(store, keys, update)
      : store.listen(update)
  })

  return {
    get current() {
      subscribe()
      return store.get()
    }
  }
}
