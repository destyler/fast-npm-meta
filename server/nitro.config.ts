import { execSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoUrl = 'https://github.com/antfu/fast-npm-meta'
function resolveRevision() {
  if (process.env.VERCEL_GIT_COMMIT_SHA)
    return process.env.VERCEL_GIT_COMMIT_SHA

  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  }
  catch {
    // CLI uploads do not necessarily include the Git checkout.
    return 'unknown'
  }
}
const revision = resolveRevision()

// https://nitro.unjs.io/config
export default defineNitroConfig({
  preset: process.env.VERCEL ? 'vercel' : 'netlify_edge',

  // Vercel builds from the workspace root, so emit the Build Output API there.
  output: process.env.VERCEL || process.env.NITRO_PRESET === 'vercel'
    ? { dir: fileURLToPath(new URL('../.vercel/output', import.meta.url)) }
    : undefined,

  storage: {
    manifest: {
      driver: 'lruCache', // Switch to `redis`?
      max: 10_000,
    },
  },

  routeRules: {
    '**': {
      cors: true,
    },
  },

  runtimeConfig: {
    app: {
      repoUrl,
      revision,
      deployTime: new Date().toISOString(),
      cacheTimeout: '',
      cacheTimeoutForce: '',
      registryUrl: '',
      registryUserAgent: '',
    },
  },

  compatibilityDate: '2025-03-28',
})
