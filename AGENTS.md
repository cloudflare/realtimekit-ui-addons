# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-25
**Commit:** e18be41
**Branch:** staging

## OVERVIEW

TypeScript library of 11 independent UI addon plugins for `@cloudflare/realtimekit-ui`. Each addon follows a class-based plugin contract: `static async init()` factory → `register(config, meeting, getBuilder)` to inject UI → `unregister()` for cleanup.

## STRUCTURE

```
realtimekit-ui-addons/
├── src/
│   ├── hand-raise/              # 3 web components + orchestrator; RTKStore integration
│   ├── reactions-manager/       # 3 web components + orchestrator; floating emoji reactions
│   ├── video-background/        # Virtual/blur background; external transformer middleware
│   ├── chat-host-control/       # Composes ParticipantTabToggle + ParticipantMenuItem
│   ├── camera-host-control/     # Composes ParticipantTabToggle + ParticipantMenuItem
│   ├── mic-host-control/        # Composes ParticipantTabToggle + ParticipantMenuItem
│   ├── custom-controlbar-button/ # Wraps rtk-controlbar-button; supports live DOM update
│   ├── participant-menu-item/   # Per-participant dropdown item with dynamic state
│   ├── participant-tile-menu/   # Overlay context menu on video tiles
│   ├── participants-tab-action/ # Full-width button in participants panel
│   └── participants-tab-toggle/ # Label + toggle switch in participants panel
├── vite.config.js               # Multi-entry lib build; 11 entry points, CJS + ESM output
├── tsconfig.cjs.json            # tsc declaration-only, CJS paths
├── tsconfig.esm.json            # tsc declaration-only, ESM paths
└── index.html                   # Dev server entry (not shipped)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Addon plugin contract | any `src/*/index.ts` | `init()` → `register()` → `unregister()` |
| Web component pattern | `src/hand-raise/HandRaiseButton.ts` | Shadow DOM, `connectedCallback` + RTKStore |
| Composing other addons | `src/chat-host-control/index.ts` | Fields instantiated at declaration time, pre-constructor |
| External lib integration | `src/video-background/index.ts` | Async middleware + global `document.body` inject |
| Build entry map | `vite.config.js` → `lib.entry` | One entry per addon |
| Package export subpaths | `package.json` → `"exports"` | `import`/`require`/`default` conditions per addon |

## CODE MAP

| Export | File | Role |
|--------|------|------|
| `HandRaiseAddon` | `src/hand-raise/index.ts` | Registers 3 web components for hand-raise flow |
| `ReactionsManagerAddon` | `src/reactions-manager/index.ts` | Floating emoji reactions + PIP badge |
| `VideoBGAddon` | `src/video-background/index.ts` | Virtual/blur/none background via async middleware |
| `ChatHostToggle` | `src/chat-host-control/index.ts` | Host chat-enable toggle; hacks SDK permissions via `Object.defineProperty` |
| `CameraHostControl` | `src/camera-host-control/index.ts` | Host camera permission control (composes primitives) |
| `MicHostControl` | `src/mic-host-control/index.ts` | Host mic permission control (composes primitives) |
| `CustomControlbarButton` | `src/custom-controlbar-button/index.ts` | Live-updatable control bar button; shadow-DOM-piercing `update()` |
| `ParticipantMenuItem` | `src/participant-menu-item/index.ts` | Per-participant dropdown item with dynamic label/icon state |
| `ParticipantTileMenu` | `src/participant-tile-menu/index.ts` | Tile context menu; DOM-walking participant ID lookup |
| `ParticipantTabAction` | `src/participants-tab-action/index.ts` | Participants panel button (`unregister` is no-op TODO) |
| `ParticipantTabToggle` | `src/participants-tab-toggle/index.ts` | Participants panel toggle; `initialValue` is a getter `() => boolean` |

## CONVENTIONS

- **Factory pattern**: `private constructor` + `static async init(props)` for addons needing async work (`ReactionsManagerAddon`, `VideoBGAddon`, `ChatHostToggle`). Simpler addons use plain `new`.
- **Custom element guard**: always `if (!customElements.get('tag')) customElements.define('tag', Class)` before defining; avoids duplicate definition errors if addon is initialized multiple times.
- **Object props via `// @ts-ignore`**: functions and objects are set as JS properties on web component elements (not as HTML attributes); `@ts-ignore` is deliberate, not a bug.
- **CSS design tokens**: use `--rtk-colors-*`, `--rtk-space-*`, `--rtk-border-*` vars; always include hardcoded fallback values.
- **`noUnusedLocals` + `noUnusedParameters`** enforced — no dead variables allowed.
- **No framework**: all components are vanilla Web Components (`HTMLElement`, Shadow DOM `mode: "open"`).
- **`jsxFactory: h`** in tsconfig — JSX not currently used but configured for Stencil/Preact-style if added later.
- **Dual output**: Vite owns JS transpilation; `tsc` is used only for `.d.ts` declaration files (`emitDeclarationOnly: true`).
- **Preset-gating**: host-only addons (`camera`, `mic`, `chat`) check `meeting.self.presetName` against an `allowedPresets` list in `register()` before injecting UI.

## ANTI-PATTERNS (THIS PROJECT)

- **Do NOT** import `Meeting` from `@cloudflare/realtimekit-ui/dist/types/types/rtk-client` as a new pattern — it is a fragile internal dist path used everywhere only because there is no public export.
- **Do NOT** add `console.*` calls to executed code; all existing `console.log` are inside JSDoc `@example` blocks only.
- **Do NOT** assume `unregister()` does cleanup — it is a no-op TODO stub in `custom-controlbar-button`, `participants-tab-action`, and `participants-tab-toggle`.
- **Do NOT** bypass `static async init()` with direct `new` on addons that use the factory pattern — constructors are `private`.
- **Do NOT** add tests without first establishing a test framework — no test infrastructure exists.
- **CORS required** for virtual background image URLs; images silently fail to load without it (see `video-background/index.ts:156`).

## UNIQUE STYLES

- **Host-control addons** (`camera`, `mic`, `chat`) are pure orchestrators — they compose `ParticipantTabToggle` + `ParticipantMenuItem` as class fields and delegate `register()`/`unregister()` to them. No direct DOM work.
- **Component-rich addons** (`hand-raise`, `reactions-manager`) own their rendering entirely via custom elements — no use of existing RTK UI primitives.
- `video-background` is the most complex module (~873 LOC combined): external transformer library, async middleware mutex pattern, global `document.body` modal injection, and 4 control bar injection points.
- `chat-host-control` uses `Object.defineProperty` to forcibly overwrite read-only `meeting.self.permissions` properties — an intentional deep hack into SDK internals, with no revert mechanism.

## COMMANDS

```bash
npm run build    # vite build + tsc — full production output to dist/
npm run dev      # build first, then start vite dev server (index.html)
npm run compile  # tsc only — regenerates dist/cjs/ and dist/esm/ .d.ts files
```

## NOTES

- No test suite — `package.json` has no `test` script.
- Only `dist/` is published (`"files": ["dist/"]`).
- `experimentalDecorators: true` in tsconfig but not actively used.
- `typesVersions` in `package.json` mirrors `exports` map for pre-TypeScript-4.7 compatibility.
- The `InviteAction` class in `participants-tab-action/ActionButton.ts` dispatches a `CustomEvent("onClick")` that nothing listens to — dead event code, not a hook.
- `custom-controlbar-button` is the only module using ES2022 private fields (`#field`) syntax; all others use `_` prefix convention.
