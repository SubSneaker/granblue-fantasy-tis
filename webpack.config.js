const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'development', // or 'production'
  devtool: 'cheap-source-map',
  entry: {
    gbcontent: './src/scripts/gbcontent.ts',
    bridgeContent: './src/scripts/bridgeContent.ts',
    popup: './src/scripts/popup.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'extension/scripts'),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: path.resolve(__dirname, 'extension/assets')
        },
        {
          from: path.resolve(__dirname, 'src/manifest.json'),
          to: path.resolve(__dirname, 'extension/manifest.json')
        },
        {
          from: path.resolve(__dirname, 'src/popup.html'),
          to: path.resolve(__dirname, 'extension/popup.html')
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      path: require.resolve("path-browserify")
    }
  },
};