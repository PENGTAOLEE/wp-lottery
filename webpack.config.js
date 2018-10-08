const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack');

module.exports = {
	mode: 'production', // development
	entry: [
		'webpack/hot/dev-server',
		// 'webpack-hot-middleware/client',
		'./src/js/index.js',
	],
	output: {
		filename: 'js/lotter_tiger.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
			    fallback: "style-loader",
			    use: "css-loader"
			  })
			},
			{
				test: /\.less$/,
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader',
					'less-loader'
				]
			},
		]
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'index.html',
			inject: 'body',
			hash: true,
			minify: {
				removeAttributeQuotes: false // 移除属性的引号
			}
		}),
		new ExtractTextPlugin("dist/css/styles.css"),
		// 另外需要使用webpack的两个插件
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin()
	],
	optimization: {
		minimize: false
	}
};