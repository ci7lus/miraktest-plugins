import crypto from "crypto"
import path from "path"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import esm from "@purtuga/esm-webpack-plugin"
import { ESBuildMinifyPlugin } from "esbuild-loader"
import webpack from "webpack"

const isProduction = false

const entries: {
  filepath: string
  target?: webpack.Configuration["target"]
}[] = [
  {
    filepath: "./src/miraktest-sample.plugin.tsx",
  },
  {
    filepath: "./src/miraktest-drpc.plugin.tsx",
    target: "electron-main",
  },
  {
    filepath: "./src/miraktest-saya.plugin.tsx",
  },
  {
    filepath: "./src/miraktest-zenza.plugin.tsx",
  },
  {
    filepath: "./src/miraktest-dplayer.plugin.tsx",
  },
]

const config: webpack.Configuration[] = entries.map(({ filepath, target }) => {
  const splited = filepath.split("/").pop()?.split(".")
  if (!splited) throw new Error("splited")
  splited.pop()
  const nameFromPath = splited.join(".")
  const hash = crypto.createHash("sha1").update(filepath).digest("hex")
  return {
    target,
    entry: {
      [nameFromPath]: filepath,
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
                          content: [filepath, "./src/dplayer/style.scss"],
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
    plugins: [new esm()],
    optimization: {
      splitChunks: false,
      minimizer: [new ESBuildMinifyPlugin({ target: "es2018" })],
    },
  }
})

export default config
