const path = require('path');

module.exports = {
  // mode: "development",
  entry: {
    main: './src/js/main.ts',
    exercises: './src/js/exercises.ts'
  },
  devtool: "inline-source-map",
  output: {
    path: path.join(__dirname, '/public/matcrab/js/'),
    filename: '[name].bundle.js',
    libraryTarget: 'var',
    library: 'Bundle'
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