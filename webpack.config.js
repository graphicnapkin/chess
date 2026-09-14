const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
try { require('dotenv').config({quiet:true}); } catch {}
module.exports = (_, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  entry: { main: './src/index.tsx', serviceWorker: './src/coi-serviceworker.js' },
  plugins: [new webpack.DefinePlugin({
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
    'process.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.SUPABASE_PUBLISHABLE_KEY || ''),
  })],
  module: { rules: [
    { test: /\.css$/i, use: ['style-loader','css-loader','postcss-loader'] },
    { test: /\.(ts|tsx)$/, exclude: /node_modules/, use: 'babel-loader' },
    { test: /\.svg$/i, issuer: /\.[jt]sx?$/, use: ['@svgr/webpack'] },
  ] },
  resolve: { extensions: ['.tsx','.ts','.js'], fallback: { crypto:false, os:false, path:false } },
  output: { filename:'[name].bundle.js', path:path.resolve(__dirname,'build'), publicPath:'/' },
  devServer: { static:{directory:path.join(__dirname,'build')}, port:9000, historyApiFallback:true,
    headers: { 'Cross-Origin-Opener-Policy':'same-origin', 'Cross-Origin-Embedder-Policy':'require-corp' } },
});
