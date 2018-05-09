const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: ['webpack/hot/poll?1000', './src/index'],
    watch: true,
    mode: 'development',
    devtool: 'sourcemap',
    target: 'node',
    node: {
        __filename: true,
        __dirname: true,
    },
    externals: [nodeExternals({ whitelist: ['webpack/hot/poll?1000'] })],
    module: {
        rules: [
            {
                test: /\.-spec.js?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            presets: [['env', { modules: false }], 'stage-0'],
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.(graphql|gql)$/,
                exclude: /node_modules/,
                // loader: 'raw-loader',
                loader: path.resolve('./gql-loader.js'),
                // loader: 'graphql-tag/loader',
            },
        ],
    },
    plugins: [
        new StartServerPlugin('server.js'),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': { BUILD_TARGET: JSON.stringify('server') },
        }),
        new Dotenv(),
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            entryOnly: false,
        }),
    ],
    output: { path: path.join(__dirname, 'dist'), filename: 'server.js' },
};
