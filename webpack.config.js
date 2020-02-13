const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
    entry: './src/index.js'
};
module.exports = {
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
                test: /\.(png|jpe?g|gif|glb)$/i,
                use: [{ loader: 'file-loader' }]
            },
            {
                test:/\.(s*)css$/,
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
            filename: "[name].css",
            chunkFilename: "[id].css",
        })
    ]
};
