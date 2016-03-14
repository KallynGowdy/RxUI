var webpack = require('webpack');

module.exports = {
    entry: {
        'rxui.umd': './src/main',
        'rxui.umd.min': './src/main'
    },
    output: {
        filename: '[name].js',
        path: 'bundles',
        library: 'RxUI',
        libraryTarget: 'umd'
    },
    externals:
    [
        {
            "rxjs/Rx": {
                root: "Rx",
                commonjs: "rxjs/Rx",
                amd: "rxjs/Rx"
            }
        },

        // Every Non Relative Import is an
        // external dependency
        /^[a-zA-Z\-0-9\/]*$/
    ],
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ]
};