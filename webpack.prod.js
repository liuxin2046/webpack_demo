/*
 * @Author: neil liu
 * @Date: 2020-09-25 14:00:56
 * @LastEditors: neil liu
 * @LastEditTime: 2020-11-05 17:57:56
 * @Description: file content
 */
const { entry, baseModuleRules, basePlugins } = require('./webpack.base.js')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
module.exports = {
  mode: 'production',
  entry,
  output: {
    filename: 'js/[name][chunkhash:8].js',
    path: path.join(__dirname, 'dist'),
    publicPath: path.join(__dirname, 'dist')
  },
  resolve: {
    // 设置别名
    alias: {
      '@': path.resolve('src') // 这样配置后 @ 可以指向 src 目录
    }
  },
  module: {
    rules: [
      ...baseModuleRules,
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true
            }
          },
          'css-loader',
          'less-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true
            }
          },
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    ...basePlugins,
    new MiniCssExtractPlugin({
      filename: 'css/[name][contenthash:8].css'
    }),
    new OptimizeCSSAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano')
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: [/\.js$/]
      })
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2
        }
      }
    }
  }
}
