const webpack = require('webpack');
const path = require('path');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        client: './src/bootstrap.ts'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        modules: ['node_modules', './src']
    },
    node: {
        Buffer: false
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'assets/main.client.[id].[chunkhash].js',
        chunkFilename: 'assets/chunk.client.[id].[chunkhash].js',
    },
    module: {
        rules: [{
            test: /\.(html)$/,
            use: [{
                loader: 'html-loader',
                options: {
                    minimize: true,
                    removeComments: true,
                    collapseWhitespace: true
                }
            }]
        }, {
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
            use: 'ts-loader'
        }]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: "client",
            children: true,
        }),
        // new webpack.optimize.UglifyJsPlugin({
        //     exclude: [/client.4/i]
        // }),
        new SWPrecacheWebpackPlugin({
            cacheId: 'hacker-news',
            filename: 'sw.js',
            maximumFileSizeToCacheInBytes: 4194304,
            minify: true,
            navigateFallback: '/index.html',
            runtimeCaching: [{
                urlPattern: /^https:\/\/node-hnapi.herokuapp.com/,
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
            template: 'src/index.ejs',
            chunksSortMode: 'dependency',
            inject: 'body'
        }),
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'async',
            prefetch: [/chunk/],
            inline: [/main/]
        }),
        new CopyWebpackPlugin([{
            from: 'src/assets',
            to: 'assets'
        }, ]),
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    devServer: {
        port: 8080,
        host: 'localhost',
        historyApiFallback: true,
        watchOptions: {
            ignored: /node_modules/
        },
        setup: function (app) {

        }
    },
};