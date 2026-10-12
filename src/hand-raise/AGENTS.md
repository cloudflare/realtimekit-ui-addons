# hand-raise

Three cooperating web components for participant hand-raise gesture + host list view.

## STRUCTURE

```
hand-raise/
├── index.ts           # HandRaiseAddon — orchestrator; registers 3 custom elements
├── HandRaiseButton.ts # rtk-hand-raise-toggle — control bar toggle button
├── HandRaisedList.ts  # rtk-hand-raised-list — host sidebar list of raised hands
└── RaisedHand.ts      # rtk-raised-hand — icon overlay on participant tiles
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| RTKStore creation | `index.ts` → `meeting.stores.create('handRaise')` inside `static async init()` |
| Store subscribe/unsubscribe | Each component's `connectedCallback` / `disconnectedCallback` |
| Toggle hand-raise state | `HandRaiseButton.ts` → dispatches store update via `store.set(...)` |
| Host view of raised hands | `HandRaisedList.ts` → filters store state, renders sorted list |
| Tile overlay icon | `RaisedHand.ts` → reads store state per `participantId` attribute |
| PIP integration | `RaisedHand.ts:58-66` — sets `participant.raised` directly on the participant object |

## CONVENTIONS

- `HandRaiseAddon` constructor is `private`; always use `static async init(props)`.
- Store key is `'handRaise'`; created once in `init()`, read in each component via `meeting.stores.stores.get('handRaise')`.
- All three components use Shadow DOM (`mode: "open"`) and clean up event listeners on `disconnectedCallback`.

## ANTI-PATTERNS

- **`participant.raised = this.raised`** at `RaisedHand.ts:58` is a deliberate Web Core PIP workaround — Web Core reads this property directly instead of RTKStore; do not remove.
- **`as any` cast** at `index.ts:50` on `meeting.participants.pip` is an explicit backward-compatibility shim (comment: "Type-casting pip for backward compatibility"); do not replace with a typed import.
- `HandRaisedList.ts` re-renders the full list on every store update — no diffing; acceptable for small participant counts but becomes expensive at scale.
