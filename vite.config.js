import { defineConfig } from 'vite'
import p from './package.json'

const deps = [...Object.keys(p.peerDependencies) ];

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "dist",
    sourcemap: false,
    lib: {
      formats: ["cjs", "es"],
      entry: {
        'reactions-manager': "./src/reactions-manager/index.ts",
        'custom-controlbar-button': "./src/custom-controlbar-button/index.ts",
        'hand-raise': "./src/hand-raise/index.ts",
        'video-background': "./src/video-background/index.ts",
        'participants-tab-action': "./src/participants-tab-action/index.ts",
        'participants-tab-toggle': "./src/participants-tab-toggle/index.ts",
        'chat-host-control': "./src/chat-host-control/index.ts",
        'mic-host-control': "./src/mic-host-control/index.ts",
        'participant-menu-item': "./src/participant-menu-item/index.ts",
        'custom-fullscreen-element': "./src/custom-fullscreen-element/index.ts"
        'camera-host-control': "./src/camera-host-control/index.ts",
        'participant-tile-menu': "./src/participant-tile-menu/index.ts"
      },
    },
    rollupOptions: {
      external: deps
    }
  },
})
