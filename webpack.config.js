const path = require('path')

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
        use: [
          {
            loader: path.resolve(__dirname, 'src/new-loader.js'),
            options: {
              type: 'deep'
            }
          }
        ]
      }
    ]
  }
}
