'use strict';

let autoprefixer = require('gulp-autoprefixer');
let browserSync = null;
let cssnano = require('gulp-cssnano');
let eslint = require('gulp-eslint');
let gulp = require('gulp');
let gulpif = require('gulp-if');
let gutil = require('gulp-util');
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps');
let uglify = require('gulp-uglify');
let webpack = require('webpack');

let development = process.env.NODE_ENV === 'development';

if (development) {
  browserSync = require('browser-sync');
}

// Ensure we have a user-defined config.js for use throughout the app.
try {
  let fs = require('fs');
  fs.accessSync('./config.js', fs.F_OK);
} catch (e) {
  console.error('Cannot start Flood server, config.js is missing. Copy ' +
    'config.template.js to config.js.');
  return;
}

let config = require('./config');
let packageInfo = require('./package');

// Allow custom Flood proxy.
let floodServerHost = config.floodServerHost || 'localhost';
let proxyPath = `${floodServerHost}:${config.floodServerPort}`;

let dirs = {
  src: 'client',
  dist: 'server/assets',
  images: 'images',
  imagesDist: 'images',
  js: 'javascript',
  jsDist: '',
  styles: 'sass',
  stylesDist: ''
};

let files = {
  mainJs: 'app',
  mainJsDist: 'app',
  mainStyles: 'style',
  mainStylesDist: 'style'
};

let webpackDevtool = 'source-map';
let webpackWatch = false;

if (development) {
  webpackDevtool = 'eval-source-map';
  webpackWatch = true;
}

let webpackConfig = {
  devtool: webpackDevtool,
  entry: [
    'babel-polyfill',
    './' + dirs.src + '/' + dirs.js + '/' + files.mainJs + '.js'
  ],
  output: {
    filename: './' + dirs.dist + '/' + dirs.jsDist + '/' + files.mainJsDist + '.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['stage-2', 'es2015'],
          plugins: ['transform-react-jsx', 'transform-runtime']
        },
        exclude: /node_modules/
      }
    ],
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: /node_modules/
      }
    ],
    postLoaders: [
      {
        loader: 'transform/cacheable?envify'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js']
  },
  watch: webpackWatch
};

gulp.task('browsersync', () => {
  browserSync.init({
    online: true,
    open: false,
    port: 4200,
    proxy: proxyPath,
    serveStatic: ['.', './server/assets']
  });
});

gulp.task('eslint', () => {
  return gulp.src([dirs.src + '/' + dirs.js + '/**/*', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('images', () => {
  return gulp.src(dirs.src + '/' + dirs.images + '/**/*')
    .pipe(gulp.dest(dirs.dist + '/' + dirs.imagesDist));
});

gulp.task('sass', () => {
  return gulp.src(dirs.src + '/' + dirs.styles + '/' + files.mainStyles + '.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest(dirs.dist + '/' + dirs.stylesDist));
});

gulp.task('sass:development', () => {
  return gulp.src(dirs.src + '/' + dirs.styles + '/' + files.mainStyles + '.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dirs.dist + '/' + dirs.stylesDist))
    .pipe(browserSync.stream({match: "**/*.css"}));
});

gulp.task('minify-css', ['sass'], () => {
  return gulp.src(dirs.dist + '/' + dirs.stylesDist + '/' + files.mainStylesDist + '.css')
    .pipe(cssnano({
      discardComments: {
        removeAll: true
      }
    }))
    .pipe(gulp.dest(dirs.dist + '/' + dirs.stylesDist));
});

gulp.task('minify-js', ['webpack'], () => {
  return gulp.src(dirs.dist + '/' + dirs.jsDist + '/' + files.mainJs + '.js')
    .pipe(uglify({
      mangle: true,
      compress: true
    }))
    .pipe(gulp.dest(dirs.dist + '/' + dirs.jsDist));
});

gulp.task('reload', () => {
  if (development) {
    browserSync.reload();
  }
});

gulp.task('watch', () => {
  gulp.watch(dirs.src + '/' + dirs.styles + '/**/*.scss', ['sass:development']);
  gulp.watch(dirs.src + '/' + dirs.js + '/**/*', ['eslint']);
});

gulp.task('webpack', (callback) => {
  let isFirstRun = true;

  webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }

    gutil.log('[webpack]', stats.toString({
      children: false,
      chunks: false,
      colors: true,
      modules: false,
      timing: true
    }));

    if (isFirstRun) {
      isFirstRun = false;
      callback();
    } else {
      if (development) {
        browserSync.reload();
      }
    }
  });
});

gulp.task('default', ['webpack', 'sass', 'images']);

gulp.task('dist', ['default', 'minify-css', 'minify-js']);

gulp.task('livereload', ['webpack', 'images', 'sass:development', 'browsersync', 'watch']);
