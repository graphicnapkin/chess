const path = require('path')
const Dotenv = require('dotenv-webpack')
module.exports = (env, argv) => {
    const isProd = argv.mode === 'production'

    const plugins = [
        // This makes it possible to use environment variables in the app
        // specifically ones from Vercel. See https://stackoverflow.com/questions/70537132/how-to-inject-environment-variables-in-vercel-non-next-js-apps
        new Dotenv({
            systemvars: true,
        }),
    ]

    return {
        plugins,
        mode: isProd ? 'production' : 'development',
        entry: {
            main: './src/index.tsx',
            serviceWorker: './src/coi-serviceworker.js',
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader', 'postcss-loader'],
                },
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    use: ['@svgr/webpack'],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            fallback: {
                crypto: false,
                os: false,
                path: false,
            },
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            compress: true,
            port: 9000,
        },
    }
}
