var browsersync   = require('browser-sync');
var del           = require('del');
var gulp          = require('gulp');
var prefix        = require('gulp-autoprefixer');
var notify        = require('gulp-notify');
var plumber       = require('gulp-plumber');
var sass          = require('gulp-sass');
var sourcemaps    = require('gulp-sourcemaps');
var stylelint     = require('gulp-stylelint');
var tildeImporter = require('node-sass-tilde-importer');


// Define paths
var bases = {
  app:  'src/',
  dist: 'dist/',
};


// Build error messages
const onError = function(err) {
  notify.onError({
    title:    "Gulp",
    subtitle: "Failure!",
    message:  "Error: <%= error.message %>",
    sound:    "Basso"
  })(err);
  this.emit('end');
};


// BUILD SUBTASKS
// ---------------

// Clean dist
function cleanDist() {
  return del(bases.dist);
}


// CSS task
var sassOptions = {
  outputStyle: 'expanded',
  importer: tildeImporter
};
var prefixerOptions = {
  browsers: ['last 2 versions']
};
function styles() {
  return gulp
    .src(bases.app + 'scss/*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(stylelint({
      failAfterError: false,
      reportOutputDir: 'reports/lint',
      reporters: [
        {formatter: 'verbose', console: true}
      ],
      debug: true
    }))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(prefix(prefixerOptions))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(bases.dist + 'assets/css'))
    .pipe(browsersync.stream());
}


// BrowserSync
function runBrowsersync(done) {
  browsersync.init({
    server: {
      baseDir: './dist'
    },
    port: 3000,
    notify: true
  });
  done();
}


// HTML tasks
function html(done) {
  gulp.src(bases.app + '**/*.html')
    .pipe(gulp.dest(bases.dist))
    .pipe(browsersync.stream());
  done();
}


// Script tasks
function scripts() {
  return gulp.src(bases.app + 'js/*.js')
    .pipe(gulp.dest(bases.dist + 'assets/js'))
    .pipe(browsersync.stream());
}


// Image tasks
function images() {
  return gulp.src(bases.app + 'img/**/*.*')
    .pipe(gulp.dest(bases.dist + 'assets/images'))
    .pipe(browsersync.stream());
}


// Copy tasks
function copy() {
  return gulp.src(bases.app + 'assets/**/*.*')
    .pipe(gulp.dest(bases.dist + 'assets'))
    .pipe(browsersync.stream());
}


// Watch files
function watchFiles() {
  gulp.watch(bases.app+"*.html", html);
  gulp.watch(bases.app+"scss/**/*", styles);
  gulp.watch(bases.app+"js/**/*", scripts);
  gulp.watch(bases.app+"img/**/*", images);
}


// BUILD TASKS
// ------------
gulp.task('default', gulp.series(cleanDist, html, styles, scripts, images, copy, gulp.parallel(watchFiles, runBrowsersync), function (done) {
  done();
}));