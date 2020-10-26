const path = require('path');

module.exports = {
    optimization: {
        minimize: false
    },
    output: {
      path: __dirname + '/dist',
      filename: 'main.js',
      library: 'RtD3js',    // very important line
      libraryTarget: 'umd',    // very important line
      umdNamedDefine: true     // very important line
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}
