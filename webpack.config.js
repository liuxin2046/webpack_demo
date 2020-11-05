/*
 * @Author: neil liu
 * @Date: 2020-09-24 13:52:49
 * @LastEditors: neil liu
 * @LastEditTime: 2020-09-25 12:02:44
 * @Description: file content
 */
// webpack.config.js
const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const setMPA = () => {
  const entry = {}
  const HtmlWebpackPlugins = []
  const entryFiles = glob.sync(path.join(__dirname, './src/pages/*/index.js'))
  entryFiles.forEach(item => {
    const pageName = item.match(/pages\/(.*)\/index.js/)
    entry[pageName] = item
    HtmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        template: path.join(__dirname, `./src/pages/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: [pageName], // 插入的js chunk名称, 和output有关
        inject: true,
        favicon: path.join(__dirname, './src/assets/favicon.ico'),
        minify: {
          html5: true,
          collapseWhitespace: true,
          preserveLineBreaks: false,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false
        }
      })
    )
  })
  return {
    entry,
    htmlWebpackPlugins
  }
}

const { entry, htmlWebpackPlugins } = setMPA()

module.exports = {
  entry, // 设置入口
  output: {
    path: path.resolve(__dirname, 'dist'), // 设置出口文件的位置为根目录下的dist文件夹
    filename: '[name].js', // 设置出口文件名称规则
    publicPath: '/'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: ['babel-loader'] },
      { test: /\.css$/, use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            esModule: true
          }
        },
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [require('autoprefixer')]
          }
        }
      ]},
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name].[hash:8].[ext]', // 文件指纹
            outputPath: './assets/images/', // 图片文件输出目录和publicPath有关
            limit: 10 * 1024, // 转base64
          }
        }
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.less$/,
        use: [{
          loader: MiniCssExtractPlugin.loader,
          options: {
            esModule: true
          }
        },
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [require('autoprefixer')]
          }
        }, 'less-loader']
      }   
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: [/\.js$/]
      })
    ],
    splitChunks: { chunks: 'all' }
  },
  plugins: [
    ...htmlWebpackPlugins,
    new CleanWebpackPlugin(),
    new OptimizeCSSAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name][contenthash:8].css' // 输出文件名和地址
    })
  ],
  devServer: {
    contentBase: 'dist', // 开启服务的目录
    hot: true, //热更新开启
    proxy: {
      '/api': {
        target: 'http://raydaydayup.cn:3000', //代理
        pathRewrite: { '^/api': '' }
      }
    }
}
};
