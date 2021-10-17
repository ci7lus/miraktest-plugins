import crypto from "crypto"
import path from "path"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import esm from "@purtuga/esm-webpack-plugin"
import { ESBuildMinifyPlugin } from "esbuild-loader"
import { LicenseWebpackPlugin } from "license-webpack-plugin"
import webpack from "webpack"

const isProduction = false

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
  // { name: "miraktest-zenza", dir: "./src/miraktest-zenza" },
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
]

const config: (_: Entry[]) => webpack.Configuration[] = (entries: Entry[]) =>
  entries.map(({ name, dir, target }) => {
    //const pluginDir = filepath
    const hash = crypto.createHash("sha1").update(dir).digest("hex")
    return {
      target,
      entry: {
        [name + ".plugin"]: dir,
      },
      mode: isProduction ? "production" : "development",
      output: {
        path: path.resolve(__dirname, "dist"),
        library: `P${hash}`,
        libraryTarget: "var",
      },
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
                    plugins: [
                      [
                        "tailwindcss",
                        {
                          purge: {
                            enabled: true,
                            mode: "all",
                            content: [
                              path.join(dir, "**/*.{ts,tsx,js,css,scss}"),
                            ],
                            whitelist: [],
                            whitelistPatterns: [],
                          },
                          future: {
                            removeDeprecatedGapUtilities: true,
                            purgeLayersByDefault: true,
                          },
                          darkMode: "media",
                          plugins: [require("@tailwindcss/custom-forms")],
                          theme: {},
                        },
                      ],
                      "autoprefixer",
                    ],
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
          addBanner: true,
          renderBanner: (_, modules) => {
            return `/* ${name}\n${modules.map(
              (module) => `\n${module.name}\n${module.licenseText}\n`
            )} */\n`
          },
          licenseTextOverrides: {
            "@zenza/components": "MIT License 2021 segabito",
            ZenzaWatch: "MIT License 2021 segabito",
            "discord-rpc": "MIT License snek <me@gus.host>",
          },
        }) as never,
      ],
      optimization: {
        splitChunks: false,
        minimizer: [new ESBuildMinifyPlugin({ target: "es2018" })],
      },
      // ホストがグローバルに露出しているRecoil/Reactを用いる
      externals: {
        react: "root React",
        recoil: "root Recoil",
      },
    }
  })

module.exports = (env: { files?: string }) => {
  const targets = env.files?.split(",") || []
  const entr =
    0 < targets.length
      ? entries.filter((entry) => targets.includes(entry.name))
      : entries
  return config(entr)
}
