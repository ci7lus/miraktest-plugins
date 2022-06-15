import path from "path"
import { ESBuildMinifyPlugin } from "esbuild-loader"
import { LicenseWebpackPlugin } from "license-webpack-plugin"
import webpack from "webpack"
import EmbedLicenseInBundlePlugin from "./embedLicenseInBundlePlugin"

const config: webpack.Configuration = {
  entry: {
    "recoil-sync-loader": "./src/recoil-sync-loader.js",
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
  },
  plugins: [
    new LicenseWebpackPlugin() as never,
    new EmbedLicenseInBundlePlugin(),
  ],
  optimization: {
    splitChunks: false,
    minimizer: [new ESBuildMinifyPlugin({ target: "es2018" })],
  },
}

export default config
