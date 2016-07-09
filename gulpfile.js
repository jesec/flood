'use strict';

let autoprefixer = require('gulp-autoprefixer');
let browserSync = require('browser-sync');
let cssnano = require('gulp-cssnano');
let eslint = require('gulp-eslint');
let gulp = require('gulp');
let gulpif = require('gulp-if');
let gutil = require('gulp-util');
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps');
let uglify = require('gulp-uglify');
let webpack = require('webpack');

let config = require('./config');
let packageInfo = require('./package');

let development = process.env.NODE_ENV === 'development';

// Allow custom Flood proxy.
let floodServerHost = config.floodServerHost || 'localhost';
let proxyPath = `${floodServerHost}:${config.floodServerPort}`;

let dirs = {
  src: 'client',
  dist: 'server/assets',
  js: 'scripts',
  jsDist: '',
  styles: 'sass',
  stylesDist: '',
  img: 'images',
  imgDist: 'images'
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
        loader: 'babel-loader?cacheDirectory',
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
    proxy: proxyPath
  });
});

gulp.task('eslint', () => {
  return gulp.src([dirs.src + '/' + dirs.js + '/**/*', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('images', () => {
  return gulp.src(dirs.src + '/' + dirs.img + '/**/*.*')
    .pipe(gulp.dest(dirs.dist + '/' + dirs.imgDist));
});

gulp.task('sass', () => {
  return gulp.src(dirs.src + '/' + dirs.styles + '/' + files.mainStyles + '.scss')
    .pipe(gulpif(development, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulpif(development, sourcemaps.write('.')))
    .pipe(gulp.dest(dirs.dist + '/' + dirs.stylesDist))
    .pipe(browserSync.stream({match: "**/*.css"}));
});

gulp.task('minify-css', ['sass'], () => {
  return gulp.src(dirs.dist + '/' + dirs.stylesDist + '/' + files.mainStylesDist + '.css')
    .pipe(cssnano())
    .pipe(gulp.dest(dirs.dist + '/' + dirs.stylesDist));
});

gulp.task('minify-js', () => {
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
  gulp.watch(dirs.src + '/' + dirs.styles + '/**/*.scss', ['sass']);
  gulp.watch(dirs.src + '/' + dirs.img + '/**/*', ['images']);
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

gulp.task('default', ['webpack', 'sass', 'images', 'reload']);

gulp.task('dist', ['default', 'minify-css', 'minify-js']);

gulp.task('livereload', ['default', 'browsersync', 'watch']);
