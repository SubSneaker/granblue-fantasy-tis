const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development', // or 'production'
  devtool: 'cheap-source-map',
  entry: {
    // background: './src/scripts/background.ts',
    gbcontent: './src/scripts/gbcontent.ts',
    // popup: './src/popup.ts',
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