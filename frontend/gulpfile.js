'use strict';

const gulp = require('gulp');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const fs = require('fs');
const del = require('del');

gulp.task('default', ['dev']);

function getWebpackOptions() {
  return {
    debug: true,
    devtool: 'source-map',
    entry: {
      app: [
        'webpack-dev-server/client?http://localhost:8000',
        './src/webpack',
        './src/app'
      ]
    },
    output: {
      path: path.resolve('./dist'),
      filename: '[name].js'
    },
    module: {
      loaders: [
        {test: /.html$/, loader: 'file', query: {name: '[name].html'}},
        {test: /.(styl|css)$/, exclude: /node_modules/, loader: 'style!css!stylus'},
        {test: /\.js$/, exclude: /node_modules/, loader: 'react-hot'},
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            presets: ['es2015', 'react']
          }
        },
        {test: /\.(png|svg)$/, loader: 'file'}
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]
  };
}

gulp.task('dev', () => {
  new WebpackDevServer(webpack(getWebpackOptions()), {
    contentBase: './src',
    hot: true,
    inline: true,
    watchOptions: {
      aggregateTimeout: 100,
      poll: 1000
    },
    quiet: false,
    noInfo: false,
    stats: {
      colors: true
    }
  }).listen(8000, 'localhost', (err) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log('server is running at http://localhost:8000');
    }
  });
});

gulp.task('build', ['clean'], () => {
  webpack(getWebpackOptions(), (err) => {
    if (err) {
      console.log(err)
    }
  });

  gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', () => {
  return del('./dist');
});