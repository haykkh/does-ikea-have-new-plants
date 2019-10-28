
// Load plugins
const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cssnano = require("cssnano");
const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const sass = require("gulp-sass");

// BrowserSync (callback)
function browserSync(done) {
  browsersync.init({
    proxy: 'localhost:5000'
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del(["./static/"]);
}

// Optimize Images
function images() {
  return gulp
    .src("./src/img/**/*")
    .pipe(newer("./static/img"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./static/img"));
}

// CSS task
function css() {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gulp.dest("./static/css/"))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./static/css/"))
    .pipe(browsersync.stream());
}

// Transpile, concatenate and minify scripts
function scripts() {
  return (
    gulp
      .src(["./src/js/**/*"])
      .pipe(plumber())
      .pipe(gulp.dest("./static/js/"))
      .pipe(browsersync.stream())
  );
}

// Copy fonts
function fonts() {
  return gulp
    .src("./src/fonts/**/*.woff2", "./src/fonts/**/*.woff", "./src/fonts/**/*.ttf")
    .pipe(gulp.dest("./static/fonts/"))
    .pipe(browsersync.stream())
};

// Watch files
function watchFiles() {
  gulp.watch("./src/scss/**/*", css);
  gulp.watch("./src/js/**/*", scripts);
  gulp.watch("./templates/**/*", browserSyncReload);
  gulp.watch("./src/img/**/*", images);
  gulp.watch("./src/fonts/**/*", fonts);
}

// define complex tasks
const js = scripts;
const build = gulp.series(clean, gulp.parallel(css, images, js, fonts));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.css = css;
exports.js = js;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.dev = watch;
exports.default = watch;