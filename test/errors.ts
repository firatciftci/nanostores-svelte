import { map, WritableAtom } from 'nanostores'

import { useStore } from '../index.js'

type TestType =
  | { id: string; isLoading: true }
  | { a: string; b: number; c?: number; isLoading: false }

let test = map<TestType>()

let testValue = useStore(test)
if (!testValue.current.isLoading) {
  testValue.current.b
}

// THROWS Property 'a' does not exist on type
testValue.current.a

let testValueSlice = useStore(test, { keys: ['isLoading', 'a'] })
if (!testValueSlice.current.isLoading) {
  testValueSlice.current.a
  testValueSlice.current.b
}
if (testValueSlice.current.isLoading) {
  testValueSlice.current.id
  // THROWS Property 'a' does not exist on type
  testValueSlice.current.a
}

declare const customStore: WritableAtom<TestType> & {
  setKey: (key: 'hey' | 'there', value: unknown) => void
}
{
  // THROWS Type '"does-not-exist"' is not assignable
  useStore(customStore, { keys: ['does-not-exist'] })

  let customSlice = useStore(customStore, { keys: ['hey', 'there'] })
  customSlice.current
}
