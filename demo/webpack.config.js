var path = require('path');

module.exports = {
  context: __dirname,
  entry: {
    nested: './src/nested/index.js',
    iframe: './src/iframe/index.js',
    custom: './src/custom/index.js',
  },
  output: {
    publicPath: '/demo/',
    path: path.join(__dirname, '/dist'),
    filename: '[name]/index.js'
  },
  resolve: {
    packageMains: ['main'],
    extensions: ['', '.js', '.jsx'],
    alias: {
      SRC: path.join(__dirname, '/../src'),
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }, {
        test: /\.(html|png)/,
        exclude: /node_modules/,
        loader: 'file?name=[path][name].[ext]&context=' + path.join(__dirname, '/src')
      }
    ]
  }
}
