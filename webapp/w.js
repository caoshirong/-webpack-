const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const fs = require('fs');
const srcDir = path.resolve(process.cwd(), 'src');
const getEntry=()=>{
	const jsPath = path.resolve(srcDir, 'js/entry');
    const dirs = fs.readdirSync(jsPath);
    let matchs = [], files = {};
    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);
        if (matchs) {
            files[matchs[1]] = path.resolve(srcDir, 'js/entry', item);
        }
    });
    return files;
};
module.exports = [
	{
		entry: './src/style/scss/main.scss',
		output: {
			path: path.resolve(__dirname,'dist'),
			filename: "css/[name].css",
		},
		module: {
			rules: [
					{
						test: /\.(png|jpg|gif)$/,
						use: [
							{
								loader: 'url-loader',
								options: {
									limit: '8192',
									name: '[hash].[ext]',
							        outputPath: 'images/'
								}
							}
						]
					},
					/*{
						test: /\.(woff|woff2|svg|eot|ttf)\??.*$/,
						use: [
							{
								loader: 'url-loader',
								options: {
									name: '[name].[ext]',
							        outputPath: 'css/fonts'
								}
							}
						]
					},*/
					{
						test: /\.(png|jpg|gif)$/,
						use: [
							{
								loader: 'url-loader',
								options: {
									limit: '8192',
									name: '[hash].[ext]',
							        outputPath: 'images/'
								}
							}
						]
					},
					{
						test: /\.(css|scss)$/,
						use: ExtractTextPlugin.extract({
						 	// 在开发环境使用 style-loader
			                fallback: "style-loader",
			                use: [
				                {
				                    loader: "css-loader",
				                    options: {
					                    minimize: true,
					                    sourceMap: true,
					                }
				                },
				                {
				                    loader: "sass-loader",
				                    options: {
					                    sourceMap: true,
					                }
				                }
			                ]
			            })
					}
				]
		},
		plugins: [
		 	new ExtractTextPlugin('css/[name].css'),
		]
	},
	{
		entry: getEntry(),
		output: {
			path: path.resolve(__dirname,'dist'),
			filename: "js/[name].js"
		},
		module: {
			rules: [
					{
				      test: /\.(js|jsx)$/,
				      exclude: /(node_modules|bower_components)/,
				      use: {
				        loader: 'babel-loader',
				        options: {
				          presets: ['env']
				        }
				      }
				    },
				    /*{
				    	test: /\.json$/,
				    	use: {
				    		loader: 'json-loader'
				    	}
				    }*/
				]
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin(),
			new webpack.optimize.CommonsChunkPlugin({
				  name: "commons",
				  filename: "js/commons.js",
			})
		]
	}
]
