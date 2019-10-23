// Plugins
var gulp = require('gulp')
var pjson = require('./package.json')
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var cssnano = require('gulp-cssnano')
var rename = require('gulp-rename')
var del = require('del')
var plumber = require('gulp-plumber')
var pixrem = require('gulp-pixrem')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var cp = require('child_process')
var browserSync = require('browser-sync').create()

var reload = browserSync.reload

var pathsConfig = function (appName) {
  // Relative paths function
  this.app = '../' + (appName || pjson.name)

  return {
    app: this.app,
    templates: this.app + '/templates',
    css: this.app + '/static/css',
    fonts: this.app + '/static/css',
    js: this.app + '/static/js'
  }
}

var sourcesConfig = function (paths) {
  return {
    js: [
      paths.app + '/src/js/**/*.js'
    ],
    sass: [
      paths.app + '/src/sass/*.scss'
    ],
    html: [
      paths.app + '/src/html/*.html'
    ],
    images: [
      paths.images + '/*'
    ],
    fonts: [
      paths.app + '/src/fonts/**/*.ttf',
      paths.app + '/src/fonts/**/*.woff'
    ]
  }
};

var paths = pathsConfig()
var sources = sourcesConfig(paths)
/// /////////////////////////////
// Tasks
/// /////////////////////////////

// Clean task
gulp.task('clean', function () {
  return del([paths.app + '/static'])
})

// Styles autoprefixing and minification
gulp.task('styles', function () {
  return gulp.src(sources.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(plumber()) // Checks for errors
    .pipe(autoprefixer({ browsers: ['last 2 version'] })) // Adds vendor prefixes
    .pipe(pixrem()) // add fallbacks for rem units
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.reload({ stream: true }))
})

// fonts
gulp.task('fonts', function () {
  return gulp.src(sources.fonts)
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.reload({ stream: true }))
})


// Javascript minification
gulp.task('scripts', function () {
  return gulp.src(sources.js)
    .pipe(plumber()) // Checks for errors
    .pipe(uglify()) // Minifies the js
    .pipe(gulp.dest(paths.js))
    .pipe(concat('app.min.js')) // Concat files
    .pipe(gulp.dest(paths.js))
    .pipe(browserSync.reload({ stream: true }))
})

// Run Flask server
gulp.task('runServer', function() {
  return new Promise(function(resolve, reject) {
    cp.exec('python manage.py runserver')
    resolve()
  })
})

// Browser sync server for live reload
gulp.task('browserSync', function () {
  browserSync.init(
    [paths.css + '/*.css', paths.js + '/*.js', paths.templates + '/*.html'],
    {
      proxy: 'localhost:5000'
    }
  )
})

// Watch for file changes
gulp.task('watch', function () {
  gulp.watch(sources.sass, ['styles'])
  gulp.watch(sources.js, ['scripts'])
  gulp.watch(sources.fonts, ['fonts']).on('change', reload)
  gulp.watch(paths.templates + '/*.html').on('change', reload)
  gulp.watch(paths.css + '/*.css', browserSync.reload({ stream: true }))
})

// Build and compile all files
gulp.task('build', gulp.series('clean', 'styles', 'scripts', 'fonts'))

// Build all files and watches for changes
gulp.task('build:watch', gulp.parallel('build', 'watch'))

// Build all files, run the server, start BrowserSync and watch for file changes
gulp.task('default', gulp.series('build', 'runServer', 'browserSync', 'watch'))

// Build all files, start BrowserSync and watch for file changes (use it when you want to start Flask manually)
gulp.task('dev', gulp.series('build', 'browserSync', 'watch'))
