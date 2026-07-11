# Block API v3 Migration — Design & Spec

**Date:** 2026-07-10
**Branch:** `feat/block-api-v3-migration` (off `feat/general-updates`)
**Status:** Approved for implementation

## Problem

WordPress 7.0 logs a console deprecation for every CoBlocks block:

> `Block with API version 2 or lower is deprecated since version 6.9.`

The Block API version is read from each block's `block.json` (`apiVersion`).
Today across the 56 registered blocks:

- **6 blocks** declare `apiVersion: 2`
- **50 blocks** declare no `apiVersion` at all → treated as **version 1**

Both trip the "v2 or lower" warning. The fix is to bring every block to
`apiVersion: 3`, which is more than a version-number bump: v3 renders the
block's `edit` inside the editor iframe and requires `useBlockProps()` on the
edit wrapper (and `useBlockProps.save()` on any static `save` markup).

## Goal

Every registered CoBlocks block reports `apiVersion: 3`, the console warning is
gone, and **no existing user content breaks** (block validation still passes on
already-saved posts). Full backward compatibility via deprecation entries — no
content migration required of users.

## Non-Goals

- No feature or visual changes to blocks.
- No redesign of block internals beyond what v3 requires.
- No change to the PHP frontend render of dynamic blocks.

## Constraints & Guiding Principles

- **Backward compatibility first.** Any change to a static block's `save` markup
  MUST be paired with a `deprecated.js` entry preserving the previous markup so
  existing posts validate. (See `src/blocks/highlight/deprecated.js` — the
  established pattern in this repo.)
- **Follow the repo's own v2 pattern.** The 6 already-migrated blocks
  (highlight, counter, click-to-tweet, gallery-masonry, gallery-stacked,
  testimonial) are the reference implementation for `useBlockProps` +
  `useBlockProps.save()` + deprecation wiring in `index.js`.
- **iframe safety.** Under v3 the edit runs in an iframe. Any `document` /
  `window` / direct DOM access in an `edit` must use the block node's
  `ownerDocument` / `defaultView`, or a ref, rather than the top-level globals.
- **Registration path.** `registerBlockType` is called with `block.metadata`
  (the `block.json` object) in `src/utils/helper.js:123`, so adding
  `"apiVersion": 3` to a `block.json` takes effect directly.

## Block Inventory & Categories

Each block falls into one of four categories that determine the exact work.

### Category A — already `apiVersion: 2` → bump to 3 (6 blocks)

Already use `useBlockProps` + `useBlockProps.save()` and have deprecations.
Save markup is **identical** between v2 and v3, so **no new deprecation** is
needed. Work: set `apiVersion: 3`, audit `edit` for iframe-unsafe globals, run
tests.

`click-to-tweet`, `counter`, `gallery-masonry`, `gallery-stacked`, `highlight`,
`testimonials/testimonial`

### Category B — dynamic, PHP-rendered (`render: index.php`) (20 blocks)

Frontend HTML comes from PHP; `save` returns `null` or only
`<InnerBlocks.Content />`, so there is **no static save markup to validate** and
**no deprecation needed**. Work: set `apiVersion: 3`, add `useBlockProps()` to
the `edit` wrapper, iframe-audit, run tests.

`events`, `form`, `field-checkbox`, `field-date`, `field-email`,
`field-hidden`, `field-name`, `field-phone`, `field-radio`, `field-select`,
`field-submit-button`, `field-text`, `field-textarea`, `field-website`, `icon`,
`post-carousel`, `posts`, `shape-divider`, `social` (share), `social-profiles`

### Category C — static blocks with real `save` markup (v1 → v3) (~25 blocks)

The high-risk category. Work per block:
1. `apiVersion: 3` in `block.json`.
2. `useBlockProps()` on the `edit` wrapper element.
3. `useBlockProps.save()` on the `save` wrapper element.
4. **Add a `deprecated.js` entry** (or append to an existing one) reproducing
   the exact pre-migration `save` + `attributes`, so old content validates.
5. Wire `deprecated` into `index.js` settings if not already.
6. Update Jest snapshots; confirm the block still validates.

`accordion`, `accordion-item`, `buttons`, `dynamic-separator`, `event-item`,
`faq`, `faq-item`, `features`, `feature`, `food-and-drinks`, `food-item`,
`gallery-collage`, `gallery-offset`, `gif`, `hero`, `map`, `media-card`,
`opentable`, `pricing-table`, `pricing-table-item`, `row`, `column`,
`services`, `service`, `testimonials`

### Category D — trivial / null-save / transform-only (assess individually) (~5 blocks)

`save` already returns `null` or the block replaces itself on edit, so bumping
`apiVersion` is low-risk; add `useBlockProps` only if the `edit` renders real
UI. Assess each on its own.

`alert` (edit → paragraph, save null), `author`, `gist` (has `index.php`),
`gallery-carousel` (null save), `logos` (null save)

## Per-Block Procedure (the loop)

For each block, in category order (A → D, easiest/safest signal first):

1. **Plan** — open `block.json`, `edit.js`, `save.js`, `index.js`; identify
   category and the exact wrapper elements.
2. **Analyse** — does `edit` touch `document`/`window`? Does `save` emit static
   markup? Does a deprecation already exist?
3. **Improve** — apply the category's changes (apiVersion, `useBlockProps`,
   deprecation).
4. **Test** —
   - `yarn test:js -- <block-path>` (add `-u` to refresh snapshots once the new
     markup is confirmed correct). Run with limited workers
     (`--maxWorkers=2`) to avoid RAM exhaustion.
   - Confirm the block's `save.spec.js` / transforms specs pass and that
     serialized output validates.
5. **Verify no regressions** — `yarn lint:js` on changed files.
6. **Commit** — one commit per block (or per tight group of child blocks, e.g.
   a parent + its item), message `Migrate <block> to Block API v3`.
7. **Move on.**

A **pilot block** (`highlight` for Category A signal, then one Category C static
block such as `hero` or `gif`) is done first to validate the procedure and the
deprecation approach end-to-end before batching the rest.

## Testing Strategy

- **Jest unit/snapshot** (`yarn test:js`, `--maxWorkers=2`): primary signal.
  Snapshot diffs reveal exactly how save markup changed; deprecation specs
  confirm old content still validates.
- **Manual editor check** at `localhost:8888` (logged in) for a sample from each
  category: insert the block, confirm no console warning, confirm select/move
  works in the iframe, confirm an existing post with the block still opens
  without a "block contains unexpected content" recovery prompt.
- **Cypress e2e** (`yarn test:e2e`) as a final full-suite gate before wrapping
  the branch — not per block (too slow for the loop).

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Changed save markup invalidates existing posts | Deprecation entry per static block; snapshot + validation tests |
| iframe breaks `document`/`window` access in edit | Per-block iframe audit; use `ownerDocument`/refs |
| Snapshot churn hides a real regression | Review each snapshot diff by hand before `-u` |
| Child/parent block coupling (row/column, faq/faq-item) | Migrate parent + children together, test the pair |
| 57-block scope fatigue / silent skips | Track every block in a checklist; category batches |

## Definition of Done

- All 56 registered blocks declare `apiVersion: 3`.
- `grep -rL '"apiVersion": 3' src/blocks/**/block.json` returns nothing (except
  intentional deprecation-only `block.json` such as `gallery-masonry/v1`).
- No "API version 2 or lower is deprecated" warning in the editor console.
- `yarn test:js` green; `yarn lint:js` clean; `yarn test:e2e` green.
- Existing content with these blocks opens without validation errors.
