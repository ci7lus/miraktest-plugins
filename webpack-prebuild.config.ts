import path from "path"
import { ESBuildMinifyPlugin } from "esbuild-loader"
import { LicenseWebpackPlugin } from "license-webpack-plugin"
import webpack from "webpack"
import PostProcessPlugin from "./PostProcessPlugin"

const config: webpack.Configuration = {
  entry: {
    "recoil-sync-loader": "./src/recoil-sync-loader.js",
    "recoil-loader": "./src/recoil-loader.js",
    "react-loader": "./src/react-loader.js",
  },
  mode: "production",
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "source-map",
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
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    fallback: {
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      crypto: require.resolve("crypto-browserify"),
      querystring: require.resolve("querystring-es3"),
      stream: require.resolve("stream-browserify"),
      path: require.resolve("path-browserify"),
      url: require.resolve("url"),
      process: require.resolve("process"),
      buffer: require.resolve("buffer"),
    },
  },
  plugins: [
    new LicenseWebpackPlugin() as never,
    new PostProcessPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
  ],
  optimization: {
    splitChunks: false,
    minimizer: [new ESBuildMinifyPlugin({ target: "es2018" })],
  },
}

export default config
