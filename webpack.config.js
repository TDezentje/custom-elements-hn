const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const deepMerge = require('deepmerge');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

function concatMerge(destinationArray, sourceArray) {
    return destinationArray.concat(sourceArray)
}

const common = {
    node: {
        Buffer: false
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        modules: ['node_modules']
    },
    module: {
        rules: [{
            test: /\.(html|mustache)$/,
            use: [{
                loader: 'html-loader',
                options: {
                    minimize: true,
                    removeComments: true,
                    collapseWhitespace: true
                }
            }]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        })
    ]
};


const clientCommon = deepMerge(common, {
    entry: {
        client: './src/client/app/app.element.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist/client')
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: ['css-loader', 'postcss-loader', 'sass-loader']
        }]
    },
    resolve: {
        modules: [path.resolve('./src/client')]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: "client",
            children: true,
        }),
    ]
}, {
    arrayMerge: concatMerge
});

const assets = {};

const client = deepMerge(clientCommon, {
    output: {
        filename: 'assets/client.[id].[chunkhash].js',
        chunkFilename: 'assets/client.[id].[chunkhash].js',
    },
    module: {
        rules: [{
            test: /\.ts?$/,
            use: 'ts-loader'
        }]
    },
    plugins: [
        new WebpackCleanupPlugin({
            exclude: ["sw.js", "assets/fetch.js", "assets/webcomponents-platform.js", "assets/custom-elements.js", "assets/icons/**/*", "assets/client-polyfilled.*"]
        }),
        new UglifyJSPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true
            },
            comments: false
        }),
        new SWPrecacheWebpackPlugin({
            cacheId: 'hacker-news',
            filename: 'sw.js',
            maximumFileSizeToCacheInBytes: 4194304,
            minify: true,
            runtimeCaching: [{
                urlPattern: /^https:\/\/node-hnapi.herokuapp.com/,
                handler: 'networkFirst'
            }, {
                urlPattern: /^https:\/\/fonts.googleapis.com/,
                handler: 'cacheFirst'
            }, {
                urlPattern: /^https:\/\/fonts.gstatic.com/,
                handler: 'cacheFirst'
            }, {
                urlPattern: /\//,
                handler: 'cacheFirst'
            }]
        }),
        function () {
            this.plugin("done", function (stats) {
                const keys = Object.keys(stats.compilation.assets);
                assets['client.js'] = '/' + keys[keys.length - 1];

                require("fs").writeFileSync(
                    path.join(__dirname, "dist", "assets.json"),
                    JSON.stringify(assets));
            });
        }
    ]
}, {
    arrayMerge: concatMerge
});

const polyfilledClient = deepMerge(clientCommon, {
    output: {
        filename: 'assets/client-polyfilled.[id].[chunkhash].js',
        chunkFilename: 'assets/client-polyfilled.[id].[chunkhash].js',
    },
    module: {
        rules: [{
            test: /\.ts?$/,
            loader: 'ts-loader',
            options: {
                configFileName: 'tsconfig.polyfill.json'
            }
        }]
    },
    plugins: [
        new WebpackCleanupPlugin({
            exclude: ["sw.js", "assets/fetch.js", "assets/webcomponents-platform.js", "assets/custom-elements.js", "assets/icons/**/*", "assets/client.*"]
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true
            },
            mangle: {
                screw_ie8: true
            }
        }),
        function () {
            this.plugin("done", function (stats) {
                const keys = Object.keys(stats.compilation.assets);
                assets['client-polyfilled.js'] = '/' + keys[keys.length - 1];

                require("fs").writeFileSync(
                    path.join(__dirname, "dist", "assets.json"),
                    JSON.stringify(assets));
            });
        }
    ]
}, {
    arrayMerge: concatMerge
});

const server = deepMerge(common, {
    target: 'node',
    node: {
        __filename: true,
        __dirname: true
    },
    entry: './src/server/app.ts',
    resolve: {
        modules: [path.resolve('./src/server')]
    },
    module: {
        exprContextRegExp: /^\.\/.*$/,
        unknownContextRegExp: /^\.\/.*$/,
        rules: [{
            test: /\.ts?$/,
            use: 'ts-loader'
        }]
    },
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist')
    }
}, {
    arrayMerge: concatMerge
});



module.exports = [
    client,
    polyfilledClient,
    server
]