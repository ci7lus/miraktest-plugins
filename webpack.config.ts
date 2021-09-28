import crypto from "crypto"
import path from "path"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import esm from "@purtuga/esm-webpack-plugin"
import { ESBuildMinifyPlugin } from "esbuild-loader"
import webpack from "webpack"

const isProduction = false

const entries: {
  name: string
  dir: string
  target?: webpack.Configuration["target"]
}[] = [
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
  { name: "miraktest-zenza", dir: "./src/miraktest-zenza" },
  {
    name: "miraktest-dplayer",
    dir: "./src/miraktest-dplayer",
  },
]

const config: webpack.Configuration[] = entries.map(({ name, dir, target }) => {
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
                          content: [path.join(dir, "*.{ts,tsx,js,css,scss}")],
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
