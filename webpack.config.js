/**
 * Created by ngm on 2018/3/18.
 */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const publicPath = "/";
const buildPath = "build";
module.exports = {
  entry: {
    main: "./frame/index.js"
  },
  output: {
    path: path.resolve(__dirname, "build"), //__dirname+'/build'
    filename: "bundle.js", //[name]-bundle.js
    publicPath: publicPath
  },
  //html页面扩展
  plugins: [
    new HtmlWebpackPlugin({
      template: "./views/views/test.pug",
      filename: "test.html" //./views/index.html
    })
  ],
  //loader加载器
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["es2015", "react"]
          }
        }
      },
      { test: /\.pug$/, loader: ["raw-loader", "pug-html-loader"] },
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
    // webpack版本不同，写法不同  rules和loaders
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  resolveLoader: {
    modules: ["node_modules", "bower_components"]
  }
};
