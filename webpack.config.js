const path = require('path');
const webpack = require('webpack');
const webpackNodeExternals = require('webpack-node-externals');
// Code splitting
const LoadablePlugin = require('@loadable/webpack-plugin');

/*
 *  Client
 */
const clientBundle = {
    entry: './src/client/index.js',
    mode: 'development',
    devtool: 'source-map',
    output: {
        filename: 'app.bundle.js',
        path: path.resolve(__dirname, './dist/bundle/'),
        // Used by loadable components to find chunks
        publicPath: '/static/bundle/'
    },
    resolve: {
        alias: {
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@types': path.resolve(__dirname, 'src/types'),
            '@client': path.resolve(__dirname, 'src/client')
        }
    },
    module: {
        rules: [
            {
                test: /.m?js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /.m?css$/,
                //exclude: /node_modules/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new LoadablePlugin(),
        new webpack.DefinePlugin({
            __isBrowser__: 'true'
        })
    ]
}

/**
 *  Server
 */
const serverBundle = {
    entry: './src/server/index.js',
    target: 'node',
    mode: 'development',
    externals: [webpackNodeExternals()],
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'server.bundle.js'
    },
    resolve: {
        alias: {
            '@api': path.resolve(__dirname, 'src/server/api'),
            '@controllers': path.resolve(__dirname, 'src/server/controllers'),
            '@db': path.resolve(__dirname, 'src/server/db'),
            '@services': path.resolve(__dirname, 'src/server/services'),
            '@types': path.resolve(__dirname, 'src/types'),
            '@utils': path.resolve(__dirname, 'src/utils'),
        }
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            __isBrowser__: 'false'
        })
    ]
}

module.exports = [
    serverBundle,
    clientBundle
]
