'use strict';

const gulp = require('gulp');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const fs = require('fs');
const del = require('del');
const nib = require('nib');
const ReactDOMServer = require('react-dom/server');
const htmlreplace = require('gulp-html-replace');
const rename = require('gulp-rename');
const React = require('react');

const FOLDER_SRC = path.resolve('./src');
const FOLDER_DIST = path.resolve('./dist');
const PATH_ENTRY = path.join(FOLDER_SRC, 'app');
const PATH_LAYOUT = path.join(FOLDER_SRC, 'components/Layout');
const PATH_WEBPACK = path.join(FOLDER_SRC, 'webpack');

const babelOptions = {
  presets: ['es2015', 'react']
}

gulp.task('default', ['dev']);

function getWebpackOptions(debug) {
  let options = {
    entry: {
      app: [
        PATH_ENTRY
      ]
    },
    output: {
      path: FOLDER_DIST,
      filename: '[name].js'
    },
    module: {
      loaders: [
        {test: /\.js$/, exclude: /node_modules/, loader: 'react-hot'},
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: babelOptions
        },
        {test: /\.(png|svg|ogv|mp4|wav)$/, loader: 'file'},
        {test: /\.(styl|css)$/, loader: 'style!css!stylus'}
      ]
    },
    stylus: {
      use: [nib()],
      import: ['~nib/lib/nib/index.styl']
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]
  };

  if (debug) {
    options.debug = true;
    options.devtool = 'source-map';
    options.entry.app.unshift('webpack-dev-server/client?http://localhost:8000', PATH_WEBPACK);
  }

  return options;
}

gulp.task('dev', () => {
  new WebpackDevServer(webpack(getWebpackOptions(true)), {
    contentBase: FOLDER_SRC,
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
  webpack(getWebpackOptions(false), (err) => {
    if (err) {
      console.log(err)
    }
  });
});

gulp.task('clean', () => {
  return del(FOLDER_DIST);
});

gulp.task('dist', ['build'], () => {
  require('react');
  require('babel-register')(babelOptions);
  require.extensions['.svg'] = () => {};
  require.extensions['.png'] = () => {};
  require.extensions['.mp4'] = () => {};
  require.extensions['.wav'] = () => {};
  require.extensions['.styl'] = () => {};

  createGlobals();

  function render(src, dst, content) {
    return gulp.src(src, { cwd: FOLDER_SRC })
      .pipe(htmlreplace({
        mount: {
          src: '',
          tpl: content,
        },
      }))
      .pipe(rename(dst))
      .pipe(gulp.dest(FOLDER_DIST));
  }

  const Layout = require(PATH_LAYOUT).default;
  const content = ReactDOMServer.renderToString(React.createElement(Layout));
  return render('index.html', 'index.html', content);
});

function createGlobals() {
  global.window = {
    matchMedia() {
      return {matches: false};
    }
  };

  global.document = {
    addEventListener() {}
  };

  global.navigator = {
    userAgent: {
      match() {}
    }
  };

  global.Parallax = function() {};
  global.EventSource = function() {};
}
