import react from '@vitejs/plugin-react'
import {createRequire} from 'node:module'
import {resolve} from 'node:path'
import {visualizer} from 'rollup-plugin-visualizer'
import {merge} from 'ts-deepmerge'
import {UserConfig} from 'vite'
import dts from 'vite-plugin-dts'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

export const createTemplateConfig = (dirname: string, overrideConfig: UserConfig = {}) => {
  const defaultConfig: UserConfig = {
    build: {
      outDir: 'dist',
      target: 'es2022',
    },
    test: {
      watch: false,
      include: [resolve(dirname, 'src', '__tests__', '**', '*.test.ts?(x)')],
      sequence: {
        hooks: 'stack',
      },
    },
    plugins: [
      tsconfigPaths(),
    ],
  }

  return merge(defaultConfig, overrideConfig) as UserConfig
}

export const createWebConfig = (dirname: string, overrideConfig: UserConfig = {}) => {
  const defaultConfig: UserConfig = createTemplateConfig(dirname, {
    build: {
      assetsInlineLimit: 64 * 1024,
    },
    plugins: [
      svgr({
        include: '**/*.svg?react',
        svgrOptions: {
          plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
          dimensions: false,
          typescript: true,
        },
        esbuildOptions: {
          loader: 'tsx',
        },
      }),
      react(),
      visualizer(),
    ],
  })

  return merge(defaultConfig, overrideConfig) as UserConfig
}

export const createNodeConfig = (dirname: string, overrideConfig: UserConfig = {}) => {
  const require = createRequire(import.meta.url)
  const pkg = require(resolve(dirname, 'package.json'))

  const defaultConfig: UserConfig = createTemplateConfig(dirname, {
    build: {
      minify: false,
      sourcemap: true,
      lib: {
        formats: ['es'],
        entry: resolve(dirname, 'src/index'),
        fileName: (_format, entryName) => `${entryName}.js`,
      },
      rollupOptions: {
        treeshake: false,
        output: {
          preserveModules: true,
          preserveModulesRoot: `${dirname}/src`,
        },
        external: [
          '^node:.*$',
          '.*__generated__.*',
          '.*__tests__.*',
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.peerDependencies || {}),
        ].map(dep => new RegExp(`^${dep}`)),
      },
    },
    plugins: [
      dts({
        exclude: [resolve(dirname, 'src', '__tests__', '**')],
        entryRoot: resolve(dirname, 'src'),
      }),
    ],
  })

  return merge(defaultConfig, overrideConfig) as UserConfig
}
