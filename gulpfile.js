var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    watch = require('gulp-watch'),
    notify = require('gulp-notify'),
    browserSync = require('browser-sync'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    svgmin = require('gulp-svgmin');

var supportedBrowsers = ['last 2 versions', '> 1%', 'ie >= 8', 'Firefox ESR', 'Opera >= 12'],
    jsFiles = [];

var sourceDir = './source/',
    destDir = './dist/public/';

var reload = browserSync.reload;

function handleErrors() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end');
}

gulp.task('browser-sync', function() {

    return browserSync.init({
        port: 3001
    });
});

gulp.task('styles', function() {

    return gulp.src(sourceDir + 'sass/style.scss')
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(autoprefixer({
            browsers: supportedBrowsers,
            map: true
        }))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gulp.dest(destDir + 'stylesheets'));
});

gulp.task('scripts', function() {

    var bundler = browserify({
        entries: [sourceDir + '/scripts/app.js'],
        cache: {},
        packageCache: {},
        fullPaths: true
    });

    bundler.transform(reactify);

    function rebundle() {
        var stream = bundler.bundle();
        return stream.on('error', handleErrors)
            .pipe(source('app.js'))
            .pipe(gulp.dest(destDir + 'scripts/'));
    }

    bundler.on('update', function() {
        rebundle();
    });

    return rebundle();
});

gulp.task('svg', function() {

    return gulp.src(sourceDir + '/images/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest(sourceDir + '/images'));
});

gulp.task('watch', function () {
    gulp.watch(sourceDir + 'sass/**/*.scss', ['styles']);
    gulp.watch(sourceDir + 'scripts/**/*.js', ['scripts', reload]);
});

gulp.task('default', ['scripts', 'styles', 'watch', 'browser-sync']);
