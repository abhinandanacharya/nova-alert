# Nova Alert

A modern, spring-animated alert / confirm / toast library — a drop-in, dependency-free alternative to SweetAlert with smoother, fancier transitions (drawn icons, spring easing, staggered reveals).

**[Live demo](example/index.html)**

 ![Nova Alert demo](assets/nova-alert-demo.gif)

## Install via CDN (jsDelivr, pulls straight from this GitHub repo)

No npm install needed. Add these two tags to any HTML page:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/abhinandanacharya/nova-alert@main/dist/nova-alert.min.css">
<script src="https://cdn.jsdelivr.net/gh/abhinandanacharya/nova-alert@main/dist/nova-alert.min.js"></script>
```

That's it — `window.NovaAlert` is now available globally.

> `@main` always serves the latest commit on the `main` branch. For production use, pin to a tagged release instead so updates never break you silently, e.g. after you push a `v1.0.0` tag:
>
> ```html
> <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/abhinandanacharya/nova-alert@v1.0.0/dist/nova-alert.min.css">
> <script src="https://cdn.jsdelivr.net/gh/abhinandanacharya/nova-alert@v1.0.0/dist/nova-alert.min.js"></script>
> ```

## Usage

```js
// Simple alert
NovaAlert.fire({
  type: 'success',       // success | error | warning | info
  title: 'All set',
  text: 'Your changes have been saved.'
});

// Auto-dismiss after 2.5s with a progress bar
NovaAlert.fire({ type: 'info', title: 'Syncing…', timer: 2500 });

// Confirm dialog — returns a Promise<boolean>
const ok = await NovaAlert.confirm({
  title: 'Delete item?',
  text: 'This will permanently remove the record.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel'
});
if (ok) { /* proceed */ }

// Toast (top-right, stacks automatically)
NovaAlert.toast({ type: 'success', title: 'Copied to clipboard' });
```

## API

### `NovaAlert.fire(options)`
| Option | Type | Default | Description |
|---|---|---|---|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Icon + accent color |
| `title` | `string` | — | Heading text |
| `text` | `string` | — | Body text |
| `confirmLabel` | `string` | `'Got it'` | Button label |
| `timer` | `number` (ms) | — | Auto-dismiss with a progress bar |
| `allowOutsideClick` | `boolean` | `false` | Prevent closing by clicking outside the dialog |
| `allowEscapeKey` | `boolean` | `false` | Allow dismissal with the Escape key |
| `allowScroll` | `boolean` | `false` | Keep page scrolling enabled while the dialog is open |
| `allowKeyboard` | `boolean` | `false` | Allow keyboard interaction with the dialog |
| `focusConfirm` | `boolean` | `true` | Focus the primary action button when the modal opens |
| `allowTimer` | `boolean` | `true` | Disable the automatic timer-based closing when set to `false` |

Returns a `Promise<boolean>` — resolves `true` on button click, `false` if dismissed via backdrop click or timer.

### `NovaAlert.confirm(options)`
Same shape as `fire`, plus `cancelLabel` (default `'Cancel'`). Renders both a Cancel and Confirm button. Returns `Promise<boolean>`.

### `NovaAlert.toast(options)`
| Option | Type | Default |
|---|---|---|
| `type` | same as above | `'info'` |
| `title` | `string` | — |
| `text` | `string` | — |
| `timer` | `number` (ms) | `3200` |

## Files

```
dist/
  nova-alert.css       (source, ~7KB)
  nova-alert.min.css   (use this in production)
  nova-alert.js        (UMD, source, ~7KB)
  nova-alert.min.js    (use this in production)
example/
  index.html           (working demo)
```

Works as a plain `<script>` global (`window.NovaAlert`) or as a CommonJS module (`require('nova-alert')`).

## Publishing updates

1. Edit the source files in `dist/`.
2. Re-minify:
   ```bash
   npx terser dist/nova-alert.js -c -m -o dist/nova-alert.min.js --comments '/^!/'
   npx cleancss -o dist/nova-alert.min.css dist/nova-alert.css
   ```
3. Commit, push, and tag a release (e.g. `git tag v1.0.1 && git push --tags`) so pinned CDN links pick it up.
4. jsDelivr caches `@main` for up to ~12 hours. To force-refresh immediately after a push, hit:
   `https://purge.jsdelivr.net/gh/abhinandanacharya/nova-alert@main/dist/nova-alert.min.js`

## License

MIT
