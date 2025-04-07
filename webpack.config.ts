import path from "path"
import { ESBuildMinifyPlugin } from "esbuild-loader"
import { encode } from "js-base64"
import { LicenseWebpackPlugin } from "license-webpack-plugin"
import type { Config } from "tailwindcss"
import webpack from "webpack"
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"
import PostProcessPlugin from "./PostProcessPlugin"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindConfig = require("./tailwind.config")

type Entry = {
  name: string
  dir: string
  target?: webpack.Configuration["target"]
  externals?: webpack.Configuration["externals"]
}

const entries: Entry[] = [
  {
    name: "miraktest-sample",
    dir: "./src/miraktest-sample",
    externals: ["os", "fs"],
  },
  {
    name: "miraktest-drpc",
    dir: "./src/miraktest-drpc",
    target: "electron-main",
    externals: ["os", "fs"],
  },
  {
    name: "miraktest-rmcn",
    dir: "./src/miraktest-rmcn",
    target: "electron-main",
    externals: ["os", "fs"],
  },
  {
    name: "miraktest-saya",
    dir: "./src/miraktest-saya",
  },
  {
    name: "miraktest-dplayer",
    dir: "./src/miraktest-dplayer",
  },
  {
    name: "miraktest-epgs",
    dir: "./src/miraktest-epgs",
  },
  {
    name: "miraktest-annict",
    dir: "./src/miraktest-annict",
  },
  {
    name: "miraktest-miyou",
    dir: "./src/miraktest-miyou",
  },
  {
    name: "miraktest-nico",
    dir: "./src/miraktest-nico",
  },
  {
    name: "miraktest-nxj",
    dir: "./src/miraktest-nxj",
  },
  {
    name: "miraktest-gyazo",
    dir: "./src/miraktest-gyazo",
  },
  {
    name: "miraktest-twitter",
    dir: "./src/miraktest-twitter",
  },
  {
    name: "miraktest-local",
    dir: "./src/miraktest-local",
  },
  {
    name: "miraktest-gdrive",
    dir: "./src/miraktest-gdrive",
    target: "electron-main",
  },
]

const config: (
  _: Entry[],
  isAnalyzeEnabled: boolean
) => webpack.Configuration[] = (entries: Entry[], isAnalyzeEnabled: boolean) =>
  entries.map(({ name, dir, target, externals }) => {
    const tailwind: Config = Object.assign(
      { ...tailwindConfig },
      {
        content: [
          ...tailwindConfig.content,
          path.join(dir, "**/*.{ts,tsx,js,css,scss}"),
        ],
      }
    )
    const config: webpack.Configuration = {
      target,
      entry: {
        [name + ".plugin"]: dir,
      },
      mode: "production",
      output: {
        path: path.resolve(__dirname, "dist"),
        chunkFormat: "module",
        filename: `${name}.plugin.js`,
        library: {
          type: "module",
        },
        module: true,
      },
      devtool: "eval-cheap-source-map",
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            loader: "esbuild-loader",
            options: {
              loader: "tsx",
              target: "es2018",
            },
          },
          {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1,
                },
              },
              { loader: "sass-loader" },
              {
                loader: "postcss-loader",
                options: {
                  postcssOptions: {
                    plugins: { tailwindcss: tailwind, autoprefixer: {} },
                  },
                },
              },
            ],
          },
        ],
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
          // ホストがグローバルに露出しているRecoil/Recoil-Sync/Reactを用いる
          "recoil-sync$": path.resolve(
            __dirname,
            "./dist/recoil-sync-loader.js"
          ),
          recoil$: path.resolve(__dirname, "./dist/recoil-loader.js"),
          react$: path.resolve(__dirname, "./dist/react-loader.js"),
        },
        fallback: {
          http: require.resolve("stream-http"),
          https: require.resolve("https-browserify"),
          crypto: require.resolve("crypto-browserify"),
          querystring: require.resolve("querystring-es3"),
          stream: require.resolve("stream-browserify"),
          path: require.resolve("path-browserify"),
          url: require.resolve("url"),
          process: require.resolve("process"),
        },
      },
      plugins: [
        new LicenseWebpackPlugin({
          licenseTextOverrides: {
            "discord-rpc": "MIT License snek <me@gus.host>",
            jsbn: "Copyright (c) 2003-2005 Tom Wu <tjw@cs.Stanford.EDU>",
          },
        }) as never,
        new PostProcessPlugin(),
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process",
        }),
        new webpack.DefinePlugin({
          "process.env.GDRIVE_CRED": JSON.stringify(
            Array.from(
              encode(
                `${process.env.GDRIVE_CLIENT_ID || ""},${
                  process.env.GDRIVE_CLIENT_SECRET || ""
                }`
              )
            )
              .reverse()
              .join("")
          ),
        }),
      ],
      optimization: {
        splitChunks: false,
        minimizer: [new ESBuildMinifyPlugin({ target: "es2018" })],
      },
      externals,
      externalsType: "commonjs",
      experiments: {
        outputModule: true,
      },
    }
    if (isAnalyzeEnabled) {
      config.plugins?.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: `${name}.report.html`,
          openAnalyzer: false,
        }) as never
      )
    }
    return config
  })

module.exports = (env: { files?: string; analyze?: string }) => {
  const isAnalyzeEnabled = env.analyze === "yes"
  const targets = env.files?.split(",") || []
  const entr =
    0 < targets.length
      ? entries.filter((entry) => targets.includes(entry.name))
      : entries
  return config(entr, isAnalyzeEnabled)
}
