module.exports = {
  context: __dirname,
  entry: "./src/index.js",
  output: {
    publicPath: '/dist/',
    path: __dirname + "/dist",
    filename: 'index.js'
  },
  resolve: {
    packageMains: ['main'],
    extensions: ['', '.js', '.jsx'],
    alias: {
      SRC: __dirname + '/../src',
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?stage=0'
      }, {
        test: /\.(html|png)/,
        exclude: /node_modules/,
        loader: 'file?name=[path][name].[ext]&context=' + __dirname + '/src'
      }
    ]
  }
};
