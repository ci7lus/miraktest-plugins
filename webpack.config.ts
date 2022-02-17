import crypto from "crypto"
import path from "path"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import esm from "@purtuga/esm-webpack-plugin"
import { ESBuildMinifyPlugin } from "esbuild-loader"
import { LicenseWebpackPlugin } from "license-webpack-plugin"
// eslint-disable-next-line import/no-unresolved
import { TailwindConfig } from "tailwindcss/tailwind-config"
import webpack from "webpack"
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"
import EmbedLicenseInBundlePlugin from "./embedLicenseInBundlePlugin"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tailwindConfig = require("./tailwind.config")

type Entry = {
  name: string
  dir: string
  target?: webpack.Configuration["target"]
}

const entries: Entry[] = [
  {
    name: "miraktest-sample",
    dir: "./src/miraktest-sample",
  },
  {
    name: "miraktest-drpc",
    dir: "./src/miraktest-drpc",
    target: "electron-main",
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
    name: "miraktest-gyazo",
    dir: "./src/miraktest-gyazo",
  },
  {
    name: "miraktest-twitter",
    dir: "./src/miraktest-twitter",
  },
]

const config: (
  _: Entry[],
  isAnalyzeEnabled: boolean
) => webpack.Configuration[] = (entries: Entry[], isAnalyzeEnabled: boolean) =>
  entries.map(({ name, dir, target }) => {
    const hash = crypto.createHash("sha1").update(dir).digest("hex")
    const tailwind: TailwindConfig = Object.assign(
      { ...tailwindConfig },
      {
        purge: {
          ...tailwindConfig.purge,
          content: [path.join(dir, "**/*.{ts,tsx,js,css,scss}")],
        },
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
        library: `P${hash}`,
        libraryTarget: "var",
      },
      devtool: "cheap-eval-source-map",
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
              "sass-loader",
              {
                loader: "postcss-loader",
                options: {
                  postcssOptions: {
                    plugins: [["tailwindcss", tailwind], "autoprefixer"],
                  },
                },
              },
            ],
          },
        ],
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
      },
      plugins: [
        new esm(),
        new LicenseWebpackPlugin({
          licenseTextOverrides: {
            "discord-rpc": "MIT License snek <me@gus.host>",
          },
        }) as never,
        new EmbedLicenseInBundlePlugin(),
      ],
      optimization: {
        splitChunks: false,
        minimizer: [new ESBuildMinifyPlugin({ target: "es2018" })],
      },
      // ホストがグローバルに露出しているRecoil/Reactを用いる
      externals: {
        react: "'React' in globalThis?React:{}",
        recoil: "'Recoil' in globalThis?Recoil:{}",
        fs: "commonjs fs",
        os: "commonjs os",
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
