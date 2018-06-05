var gulp          = require('gulp'),
    browserSync   = require('browser-sync'),
    prefix        = require('gulp-autoprefixer'),
    cleanCSS      = require('gulp-clean-css'),
    notify        = require('gulp-notify'),
    plumber       = require('gulp-plumber'),
    rename        = require('gulp-rename'),
    sass          = require('gulp-sass'),
    sourcemaps    = require('gulp-sourcemaps'),
    runSequence   = require('run-sequence'),
    reload        = browserSync.reload,
    del           = require('del'),
    vinylPaths    = require('vinyl-paths'),
    colors        = require('colors');

var bases = {
    app:  'src/',
    dist: 'dist/',
};

colors.setTheme({
  silly:   'rainbow',
  input:   'grey',
  verbose: 'cyan',
  prompt:  'grey',
  info:    'green',
  data:    'grey',
  help:    'cyan',
  warn:    'yellow',
  debug:   'blue',
  error:   'red'
});

var displayError = function(error) {
  // Build the error
  var errorString = '[' + error.plugin.error.bold + ']';
  errorString += ' ' + error.message.replace("\n",'');
  if(error.fileName)
      errorString += ' in ' + error.fileName;
  if(error.lineNumber)
      errorString += ' on line ' + error.lineNumber.bold;
  console.error(errorString);
}
var onError = function(err) {
  notify.onError({
    title:    "Gulp",
    subtitle: "Failure!",
    message:  "Error: <%= error.message %>",
    sound:    "Basso"
  })(err);
  this.emit('end');
};

// CONFIG OPTIONS
// ---------------
var sassOptions = {
  outputStyle: 'expanded'
};

var prefixerOptions = {
  browsers: ['last 2 versions']
};

// DEFINE SUBTASKS
// ---------------
gulp.task('clean:dist', function() {
  return gulp.src(bases.dist)
    .pipe(vinylPaths(del));
});

gulp.task('styles', function() {
  return gulp.src(bases.app + 'scss/*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(prefix(prefixerOptions))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(bases.dist + 'assets/css'))
    .pipe(reload({stream:true}))
});

gulp.task('styles:build', function() {
  return gulp.src(bases.dist + '*.css')
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(bases.dist))
});

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: bases.dist
    }
  });
});

gulp.task('deploy', function() {
  return gulp.src(bases.dist + '**/*.*')
    .pipe(deploy());
});

gulp.task('copy', function() {
  return gulp.src(bases.app + 'assets/**/*.*')
    .pipe(gulp.dest(bases.dist + 'assets'))
    .pipe(reload({stream:true}));
});

gulp.task('lint', function() {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(stylelint({
      failAfterError: true,
      reportOutputDir: 'reports/lint',
      reporters: [
        {formatter: 'verbose', console: true},
        {formatter: 'json', save: 'lint-report.json'}
      ],
      debug: true
    }));
});

gulp.task('html', function() {
  gulp.src(bases.app + './*.html')
    .pipe(gulp.dest(bases.dist))
    .pipe(reload({stream:true}));
});

gulp.task('js', function() {
  return gulp.src(bases.app + 'js/*')
    .pipe(gulp.dest(bases.dist + 'assets/js'))
    .pipe(reload({stream:true}));
});

gulp.task('img', function() {
  return gulp.src(bases.app + 'img/*')
    .pipe(gulp.dest(bases.dist + 'assets/images'))
    .pipe(reload({stream:true}));
});

gulp.task('watch', function() {
  gulp.watch(bases.app + 'scss/**/*.scss', ['styles']);
  gulp.watch(bases.app + './*.html', ['html']);
  gulp.watch(bases.app + 'images/*', ['img']);
  gulp.watch(bases.app + 'js/*', ['js']);
});

// BUILD TASKS
// ------------
gulp.task('default', function(done) {
  runSequence('clean:dist', 'html', 'styles', 'js', 'img', 'copy', 'styles:build', 'browser-sync', 'watch', done);
});
