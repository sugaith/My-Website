const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/index.js'
};
module.exports = {
    // node: {
    //     fs: "empty"
    // },
    // target: 'node', // in order to ignore built-in modules like path, fs, etc.
    // externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    module: {
        rules: [
            {
                test: /\.(html|htm)$/,
                use: [
                    {
                        loader: "html-loader",
                        options: {minimize: true}
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|glb)$/,
                use: [{ loader: 'file-loader' }]
            },
            {
                test:/\.(s*)css$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            title: "Sugaith's website",
            template: "./src/index.html",
            filename: "./index.html"
        }),
        new MiniCssExtractPlugin({
            //same options as webpackOptions.output
            //options are optional
            // filename: "[name].css",
            // chunkFilename: "[id].css",
        })
    ]
};
