const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const projectConfig = require('./config.js');


module.exports = {
    context: path.join(__dirname, 'src'),
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        headers: { 'Access-Control-Allow-Origin': '*' },
        port: projectConfig.port,
        publicPath: this.hmr ? `${projectConfig.host}:${projectConfig.port}/` : '',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src/'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-react',
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        browsers: ['last 2 versions', 'ie 11'],
                                    },
                                },
                            ],
                        ],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            '@babel/plugin-syntax-dynamic-import',
                            'react-hot-loader/babel',
                        ],
                    },
                },
            },
            {
                test: /\.(less|css)$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                camelCase: true,
                                localIdentName: '[local]-[hash:base64:12]',
                            },
                            modules: true,
                            sourceMap: true,

                        },

                    },
                    'less-loader',
                ],
            },
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            title: projectConfig.name,
            filename: 'index.html',
            template: '../index.html',
            projectConfig,
        }),
        new MiniCssExtractPlugin({
            filename: 'client.css',
        }),
        new CopyWebpackPlugin([
            {
                from: '../data.json',
                to: 'data.json',
            },
        ]),
    ],
};
