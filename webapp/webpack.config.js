const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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
const server = {
		    historyApiFallback:true,
		    hot:true,
		    inline:true,
		    progress:true,
	        host:'localhost',
	        proxy: {
			  "/api": {   //服务起代理--解决跨域
			    target: "http://localhost:3000",
			    bypass: function(req, res, proxyOptions) {
			      if (req.headers.accept.indexOf("html") !== -1) {
			        console.log("Skipping proxy for browser request.");
			        return "/index.html";
			      }
			    }
			  }
			},
	        //服务端压缩是否开启
	        compress:true,
	        //配置服务端口号
	        port:1717
		};
var minimize = false;
const processMode = 'production'; //production||development
/*if (process.env.NODE_ENV === 'production'){
    minimize = true;
}*/
const config = [
	{
		mode : processMode,
		devtool:'eval-source-map',
		entry: getEntry(),
		output: {
			path: path.resolve(__dirname,'dist'),
			publicPath: "/dist/",
			filename: "js/[name].js"
		},
		resolve: {
			alias: {
				jquery: path.resolve(__dirname, 'src/js/libs/jquery'),
				plugins: path.resolve(__dirname, 'src/js/plugins/'),
  				components: path.resolve(__dirname, 'src/js/components/')
			},
			extensions:['.js',".css",'jsx'] //自动补全识别后缀
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
				    {
				    	test: /\.json$/,
				    	use: {
				    		loader: 'json-loader'
				    	}
				    }
				]
		},
		optimization: {
			 // runtimeChunk: true,
		     splitChunks: {
				chunks: "async",
				minSize: 30000,
				minChunks: 1,
				maxAsyncRequests: 5,
				maxInitialRequests: 3,
				name: true,
				cacheGroups: {
					commons: {
						name: "commons",
						chunks: "all",
						minChunks: 2,
						enforce: true
					}
				}
			}
		 },
		devServer:server
	},
	{
		mode: processMode,
		devtool:'eval-source-map',
		entry: path.resolve(__dirname,'src/style/scss/', 'main.scss'),
		output: {
			path: path.resolve(__dirname,'dist'),
			publicPath: "/dist/",
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
					{
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
					},
					{
						test: /\.(css|scss)$/,
						use: ExtractTextPlugin.extract({
			                fallback: "style-loader",
			                use: [
				                {
				                    loader: "css-loader",
				                    options: {
					                    minimize: minimize,
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
		resolve: {
			extensions:['.js',".css",'jsx'] //自动补全识别后缀
		},
		plugins: [
		 	new ExtractTextPlugin("css/[name].css")
		]
	},

];

//生产模式
if (process.env.NODE_ENV === 'production') {
    config[1].devtool = "source-map";
    config[1].plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        //uglifyJs压缩
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        })
    ]);
    config.forEach((item)=>{
		item.output.publicPath = 'dist/';
	});
}
module.exports = config;