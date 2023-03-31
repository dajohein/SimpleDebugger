const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    "main": "./src/simple_debugger.js",
    "main.min": "./src/simple_debugger.js",
  },

  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [new UglifyJsPlugin({
      include: /\.min\.js$/
    })]
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    filename: '[name].js'
  }
};