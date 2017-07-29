const webpack = require('webpack');
const path = require('path');

module.exports = {
    target: 'node',
    entry: path.resolve(__dirname, './src/app.ts'),
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        modules: ['node_modules', path.resolve(__dirname, './src'), path.resolve(__dirname, '../client/src')]
    },
    node: {
        Buffer: false,
        __filename: true,
        __dirname: true
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'server.js'
    },
    module: {
        exprContextRegExp: /^\.\/.*$/,
        unknownContextRegExp: /^\.\/.*$/,
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
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ]
};