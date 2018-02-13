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
                    compilerOptions: {
                        sourceMap: true
                    },
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
        }, {
            test: /\.js$/,
            use: ["source-map-loader"],
            enforce: "pre"
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': "'development'"
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'client',
            minChunks: 2,
            deepChildren: true,
            chunks: ['list', 'item', 'user']
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.ejs'),
            chunksSortMode: 'dependency',
            inject: false,
            sw: false
        }),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, './src/assets'),
            to: 'assets'
        }, ]),
        new webpack.optimize.ModuleConcatenationPlugin()
    ]
};