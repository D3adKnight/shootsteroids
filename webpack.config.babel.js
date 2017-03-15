// @flow

import path from 'path'

import { WDS_PORT } from './src/shared/config'
import { isProd } from './src/shared/util'

export default {
  entry: [
    './src/client'
  ],
  output: {
    filename: 'js/game.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: isProd ? '/static/' : `http://localhost:${WDS_PORT}/dist/`
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  devtool: isProd ? false : 'source-map',
  resolve: {
    extensions: ['.js']
  },
  devServer: {
    port: WDS_PORT
  }
}
