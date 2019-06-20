const path = require('path');

module.exports = {
  // mode: "development",
  entry: './src/js/main.ts',
  devtool: "inline-source-map",
  output: {
    path: path.join(__dirname, '/public/matcrab/js/'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
};