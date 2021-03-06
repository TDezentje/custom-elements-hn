const webpack = require('webpack');
const path = require('path');

module.exports = {
    target: 'node',
    entry: path.resolve(__dirname, './src/app.ts'),
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        modules: ['node_modules', path.resolve(__dirname, './src'), path.resolve(__dirname, '../shared/src')]
    },
    node: {
        Buffer: false,
        __filename: true,
        __dirname: false
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'server.js'
    },
    module: {
        exprContextRegExp: /^\.\/.*$/,
        unknownContextRegExp: /^\.\/.*$/,
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
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ]
};