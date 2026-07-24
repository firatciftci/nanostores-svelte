# Nano Stores Svelte Runes

<img align="right" width="92" height="92" title="Nano Stores logo"
     src="https://nanostores.github.io/nanostores/logo.svg">

Svelte 5 ([runes](https://svelte.dev/docs/svelte/what-are-runes)) integration
for **[Nano Stores]**, a tiny state manager with many atomic tree-shakable
stores.

- **Small.** Less than 1 KB. Zero dependencies.
- **Fast.** With small atomic and derived stores, you do not need to update
  every component on every store change.
- **Tree Shakable.** The chunk contains only stores used by components
  in the chunk.
- Built on [`createSubscriber`], so it shares one subscription per store
  between all readers and stays correct under SSR.
- Was designed to move logic from components to stores.
- It has good **TypeScript** support.

```svelte
<script>
  import { useStore } from 'nanostores-svelte-runes'

  import { profile } from '../stores/profile.js'

  let user = useStore(profile)
</script>

<header>Hi, {user.current.name}</header>
```

[Nano Stores]: https://github.com/nanostores/nanostores/
[`createSubscriber`]: https://svelte.dev/docs/svelte/svelte-reactivity#createSubscriber

---

<img src="https://cdn.evilmartians.com/badges/logo-no-label.svg" alt="" width="22" height="16" /> Made at <b><a href="https://evilmartians.com/devtools?utm_source=nanostores-svelte&utm_campaign=devtools-button&utm_medium=github">Evil Martians</a></b>, product consulting for <b>developer tools</b>.

---


## Install

```sh
npm install nanostores nanostores-svelte-runes
```

Requires Svelte `>=5.7.0` (when [`createSubscriber`] was added).


## Usage

`useStore(store)` returns a reactive holder. Read `.current` to get the store’s
value. As long as you read `.current` inside a reactive context — markup,
`$derived`, or `$effect` — the component updates whenever the store changes.

```svelte
<script>
  import { useStore } from 'nanostores-svelte-runes'

  import { router } from '../stores/router.js'

  let page = useStore(router)
</script>

{#if page.current.route === 'home'}
  <HomePage />
{:else}
  <Error404 />
{/if}
```

Because `.current` is read every time, derive from it the same way you would
from any other rune:

```svelte
<script>
  import { useStore } from 'nanostores-svelte-runes'

  import { profile } from '../stores/profile.js'

  let user = useStore(profile)
  let name = $derived(user.current.name)
</script>
```

The store is only kept mounted while at least one component reads its `.current`
in an effect, and it unmounts (after Nano Stores’ unmount delay) once the last
reader is gone.


### Why not Svelte’s store contract?

Every Nano Store implements [Svelte’s store contract], so historically you could
use the `$store` auto-subscription directly. As Svelte moves from stores to
runes, `useStore` is the runes-native replacement: it has no dependency on the
store contract and plugs straight into Svelte’s signal graph.

[Svelte’s store contract]: https://svelte.dev/docs/svelte/stores


## Store Naming

Nano Stores conventionally prefixes store names with `$` (`$profile`). Svelte
**reserves the `$` prefix** for runes, so a `$`-prefixed identifier cannot be
imported or declared inside `.svelte`, `.svelte.js`, or `.svelte.ts` files.

Either drop the prefix for stores used from Svelte:

```js
// stores/profile.js
import { atom } from 'nanostores'

export let profile = atom({ name: 'Anna' })
```

…or alias the prefix away on import:

```svelte
<script>
  import { useStore } from 'nanostores-svelte-runes'

  import { $profile as profile } from '../stores/profile.js'

  let user = useStore(profile)
</script>
```


## Options

### Keys

For [`map`](https://github.com/nanostores/nanostores#maps) and
[`deepMap`](https://github.com/nanostores/nanostores#deep-maps) stores, use the
`keys` option to re-evaluate only when specific keys change:

```svelte
<script>
  import { useStore } from 'nanostores-svelte-runes'

  import { settings } from '../stores/settings.js'

  let theme = useStore(settings, { keys: ['theme'] })
</script>

<main class={theme.current.theme}>…</main>
```

`.current` always returns the whole store value; the `keys` option only narrows
which changes trigger an update.


## Server-Side Rendering

`useStore` is SSR-safe. When `.current` is read outside of an effect — as it is
during server rendering — it simply returns the current store value without
subscribing, so no listeners leak on the server.
