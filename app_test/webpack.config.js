const webpack = require('webpack');

module.exports = {
	entry: ['babel-polyfill', './views/app.tsx'],
	output: {
		filename: 'bundle.js',
		path: __dirname + '/public'
	},

	// Enable sourcemaps for debugging webpack's output.
	devtool: 'source-map',

	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: ['.ts', '.tsx', '.js', '.json']
	},

	module: {
		rules: [
			// All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
			{ test: /\.tsx?$/, 
				use : {
					loader: 'awesome-typescript-loader',
					options : {
						useBabel : true,
						useCache : true
					}
				}
			},
			{
				test: /\.jsx?$/,
				use: {
					loader: 'babel-loader'
				},
				exclude: /node_modules\/(?!(koa-cola)|(controller-decorators)\/).*/,
			},

			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			{ enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
		]
	},

	plugins: [
		new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
		new webpack.IgnorePlugin(/\.\/src\/app/),
		// new webpack.IgnorePlugin(/mongoose$/),
		new webpack.IgnorePlugin(/\.\/src\/util\/injectGlobal/),
		new webpack.IgnorePlugin(/koa$/),
		new webpack.IgnorePlugin(/koa-body$/),
		// new webpack.IgnorePlugin(/^mongoose-class-wrapper$/)
	],
	// When importing a module whose path matches one of the following, just
	// assume a corresponding global variable exists and use that instead.
	// This is important because it allows us to avoid bundling all of our
	// dependencies, which allows browsers to cache those libraries between builds.
	externals: {
		// 'react': 'React',
		// 'react-dom': 'ReactDOM'
	},
};