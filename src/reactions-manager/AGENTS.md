# reactions-manager

Three cooperating web components for floating emoji reactions + participant tile badges.

## STRUCTURE

```
reactions-manager/
├── index.ts           # ReactionsManagerAddon — orchestrator; registers 3 custom elements
├── ReactionPicker.ts  # rtk-reaction-picker — control bar button + emoji dropdown
├── ReactionOverlay.ts # rtk-reaction-overlay — full-stage floating animation layer
├── ReactionBadge.ts   # rtk-reaction-badge — per-participant tile badge; PIP integration
└── README.md          # Consumer usage docs
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Send emoji reaction | `ReactionPicker.ts` → `meeting.participants.broadcastMessage('reaction', ...)` |
| Receive + animate | `ReactionOverlay.ts:connectedCallback` → `broadcastedMessage` event listener |
| Per-tile badge display | `ReactionBadge.ts` → filters `broadcastedMessage` by `peerId`; 3-second timeout |
| PIP badge sync | `ReactionBadge.ts` → `pip.updateSource()` after each reaction |
| Emoji set | `ReactionPicker.ts` → `REACTIONS` constant (exported) |
| Custom emoji config | `ReactionsManagerAddon.init()` → `reactions` prop on `ReactionsManagerProps` |

## CONVENTIONS

- `ReactionsManagerAddon` constructor is `private`; always use `static async init(props)`.
- All three components register via `customElements.define` inside `register()`, guarded by `customElements.get()`.
- Components subscribe to `meeting` events in `connectedCallback`, unsubscribe in `disconnectedCallback`.
- `meeting` and `reactions` are set as JS object properties on elements (not HTML attributes); `// @ts-ignore` on these assignments is intentional.

## ANTI-PATTERNS

- **`PICKER_STYLES`** has conflicting `min-width: 400px` and `max-width: min(360px, 90vw)` — `min-width` wins on larger screens; known CSS issue, do not silently "fix" without testing both viewports.
- **`setTimeout(..., 0)`** in `ReactionPicker.ts` defers the outside-click `document` listener — fragile but intentional timing fix; do not inline without testing picker close behaviour.
- **Redundant re-bind** in `ReactionBadge.ts:connectedCallback` — `messageHandler` is already bound in the constructor; the `connectedCallback` re-bind is redundant but harmless; removing it requires verifying `removeEventListener` matching still works.
- **Factory asymmetry**: `static async init()` in `ReactionsManagerAddon` does no async work itself — it delegates directly to `new`; the factory exists for API consistency with other complex addons, not for async necessity.
