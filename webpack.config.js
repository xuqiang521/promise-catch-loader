require('babel-polyfill')

const path = require('path')
// const webpack = require('webpack')

module.exports = {
  entry: './test/demo.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: path.resolve(__dirname, 'src/index.js')
        }
      }
    ]
  }
}
