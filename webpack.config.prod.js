const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const srcPath = path.join(__dirname, "src");
const publicPath = path.join(__dirname, "public");
const distPath = path.join(__dirname, "dist");

module.exports = {
    mode: 'production',
    entry: path.join(srcPath, "app.ts"), 
    output: {
        filename: 'bundle.js',
        path: distPath
    },
    devtool: false,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new CleanPlugin.CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: publicPath,
                    to: distPath,
                }
            ]
        })
    ]
};