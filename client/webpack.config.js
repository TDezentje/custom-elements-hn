const webpack = require('webpack');
const path = require('path');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        client: path.resolve(__dirname, './src/bootstrap.ts')
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        modules: ['node_modules', path.resolve(__dirname, './src'), path.resolve(__dirname, '../shared/src')]
    },
    node: {
        Buffer: false
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'assets/client.[chunkhash].js',
        chunkFilename: 'assets/client.[name].[chunkhash].js',
    },
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: 'css-loader',
                options: {
                    modules: true,
                    minimize: true
                }
            }, {
                loader: 'postcss-loader'
            }, {
                loader: 'sass-loader'
            }]
        }, {
            test: /\.(ts|tsx)?$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    getCustomTransformers: () => ({
                        before: [
                            require(path.resolve(__dirname, '../typescript-transformers/dist/css-require.transform')).transformer
                        ]
                    })
                }
            }]
        }, {
            //for external minimized modules only
            test: /\.css$/,
            use: [{
                loader: 'css-loader'
            }]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': "'production'"
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "client",
            children: true,
        }),
        new webpack.optimize.UglifyJsPlugin({
            exclude: [/client.custom-elements-adapter/i]
        }),
        new SWPrecacheWebpackPlugin({
            cacheId: 'custom-elements-hn',
            filename: 'sw.js',
            maximumFileSizeToCacheInBytes: 4194304,
            minify: true,
            navigateFallback: '/index.html',
            navigateFallbackWhitelist: [/^\/(?!api|auth|files)/],
            runtimeCaching: [{
                urlPattern: "/api/*",
                handler: 'networkFirst'
            }, {
                urlPattern: /^https:\/\/fonts.googleapis.com/,
                handler: 'cacheFirst'
            }, {
                urlPattern: /^https:\/\/fonts.gstatic.com/,
                handler: 'cacheFirst'
            }]
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.ejs'),
            chunksSortMode: 'dependency',
            inject: false,
            sw: true
        }),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, './src/assets'),
            to: 'assets'
        }, ]),
        new webpack.optimize.ModuleConcatenationPlugin()
    ]
};