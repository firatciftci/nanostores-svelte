import { delay } from 'nanodelay'
import {
  atom,
  computed,
  map,
  onMount,
  onStart,
  STORE_UNMOUNT_DELAY
} from 'nanostores'
import { flushSync } from 'svelte'
import { expect, test } from 'vitest'

import { useStore } from '../index.js'

test('reads and reacts to an atom', () => {
  let store = atom('a')

  let cleanup = $effect.root(() => {
    let value = useStore(store)
    let observed: string[] = []

    $effect(() => {
      observed.push(value.current)
    })

    flushSync()
    expect(value.current).toBe('a')
    expect(observed).toEqual(['a'])

    store.set('b')
    flushSync()
    expect(value.current).toBe('b')
    expect(observed).toEqual(['a', 'b'])
  })

  cleanup()
})

test('reads and reacts to a computed store', () => {
  let first = atom(1)
  let second = atom(1)
  let sum = computed([first, second], (a, b) => a + b)

  let cleanup = $effect.root(() => {
    let value = useStore(sum)
    let observed: number[] = []

    $effect(() => {
      observed.push(value.current)
    })

    flushSync()
    expect(value.current).toBe(2)

    first.set(10)
    flushSync()
    expect(value.current).toBe(11)
    expect(observed).toEqual([2, 11])
  })

  cleanup()
})

test('re-evaluates only on the listed keys', () => {
  let store = map<{ a?: string; b?: string }>()

  let cleanup = $effect.root(() => {
    let value = useStore(store, { keys: ['a'] })
    let runs = 0

    $effect(() => {
      value.current
      runs += 1
    })

    flushSync()
    expect(runs).toBe(1)

    store.setKey('a', 'A')
    flushSync()
    expect(value.current.a).toBe('A')
    expect(runs).toBe(2)

    store.setKey('b', 'B')
    flushSync()
    expect(value.current.b).toBe('B')
    expect(runs).toBe(2)
  })

  cleanup()
})

test('shares a single subscription between readers', () => {
  let mounts = 0
  let store = atom('a')
  onStart(store, () => {
    mounts += 1
  })

  let cleanup = $effect.root(() => {
    let value = useStore(store)

    $effect(() => {
      value.current
    })
    $effect(() => {
      value.current
    })

    flushSync()
    expect(mounts).toBe(1)
  })

  cleanup()
})

test('mounts lazily and unmounts after the last reader is gone', async () => {
  let events: string[] = []
  let store = atom('')
  onMount(store, () => {
    store.set('S')
    events.push('mount')
    return () => {
      events.push('unmount')
    }
  })

  let cleanup = $effect.root(() => {
    let value = useStore(store)

    $effect(() => {
      value.current
    })

    flushSync()
    expect(value.current).toBe('S')
    expect(events).toEqual(['mount'])
  })

  cleanup()
  flushSync()
  expect(events).toEqual(['mount'])

  await delay(STORE_UNMOUNT_DELAY)
  expect(events).toEqual(['mount', 'unmount'])
})

test('returns the value without subscribing outside an effect', () => {
  let store = atom('init')

  let value = useStore(store)
  expect(value.current).toBe('init')
  expect(store.lc).toBe(0)
})
