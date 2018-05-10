// Import Gulp

const gulp = require('gulp')

// Import elements to compile es6

const babelify = require('babelify')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const watchify = require('watchify')

// Import and create Browser-sync

const browserSync = require('browser-sync').create()

// Import and create plugins loader

const plugins = require('gulp-load-plugins')()

const config =
{
  src: './src',
  dist: './dist'
}

/**********

 * DEV

**********/

// SERVER

gulp.task('server', ['styles', 'scripts', 'moveAssets', 'movePages'], () => {
  browserSync.init({
    server: config.dist
  })
  gulp.watch(`${config.src}/**/*.scss`, ['styles'])
  gulp.watch(`${config.src}/assets/**/*.*`, ['moveAssets'])
  gulp.watch(`${config.src}/**/*.html`, ['movePages'])
})

// STYLES

gulp.task('styles', () => {
  return gulp.src(`${config.src}/scss/styles.scss`)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass())
    .on('error', plugins.notify.onError({
      title: 'Compile SASS : ',
      message: '<%= error.message %>',
      sound: 'beep'
    }))
    .pipe(plugins.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest(`${config.dist}/css`))
    .pipe(browserSync.stream())
    .pipe(plugins.notify({
      title: 'Compile SASS: ',
      message: 'success',
      sound: 'beep'
    }))
})

// SCRIPTS

let bundler = null
const bundle = () => {
  bundler.bundle()
    .on('error', plugins.notify.onError({
      title: 'Compile ES6: ',
      message: '<%= error.message %>',
      sound: 'beep'
    }))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest(`${config.dist}/js`))
    .pipe(browserSync.stream())
    .pipe(plugins.notify({
      title: 'Compile ES6: ',
      message: 'success',
      sound: 'beep'
    }))
}

gulp.task('scripts', () => {
  bundler = browserify({
    entries: `${config.src}/js/app.js`,
    debug: true,
    paths: ['./node_modules', `${config.src}/js`]
  }).transform(babelify)

  bundler.plugin(watchify)

  bundler.on('update', bundle)

  bundle()
})

// MOVE ASSETS

gulp.task('moveAssets', () => {
  return gulp.src(`${config.src}/assets/**/*.*`)
    .pipe(gulp.dest(`${config.dist}/assets`))
    .pipe(browserSync.stream())
    .pipe(plugins.notify({
      title: 'Move assets: ',
      message: 'success',
      sound: 'beep'
    }))
})

// MOVE PAGES

gulp.task('movePages', () => {
  return gulp.src(`${config.src}/**/*.html`)
    .pipe(gulp.dest(`${config.dist}`))
    .pipe(browserSync.stream())
    .pipe(plugins.notify({
      title: 'Move pages: ',
      message: 'success',
      sound: 'beep'
    }))
})

/**********

 * PROD

**********/

// MINIFY CSS
gulp.task('minCss', () => {
  return gulp.src(`${config.dist}/css/styles.css`)
    .pipe(plugins.cssnano())
    .pipe(gulp.dest(`${config.dist}/css`))
})

// MINFIFY JS

gulp.task('minJs', () => {
  return gulp.src(`${config.dist}/js/bundle.js`)
    .pipe(plugins.uglify())
    .pipe(gulp.dest(`${config.dist}/js`))
})

// MINIFY IMAGES

gulp.task('minImages', () => {
  return gulp.src(`${config.dist}/assets/img/**/*.+(png|jpg|jpeg|gif|svg)`)
    .pipe(plugins.imagemin())
    .on('error', plugins.notify.onError({
      title: 'Minfiy images: ',
      message: '<%= error.message %>',
      sound: 'beep'
    }))
    .pipe(gulp.dest(`${config.dist}/assets/img`))
    .pipe(plugins.notify({
      title: 'Minify images: ',
      message: 'success',
      sound: 'beep'
    }))
})

// REMOVE MAPS

gulp.task('clean', () => {
  return gulp.src([ `${config.dist}/js/bundle.js.map`, `${config.dist}/css/styles.css.map` ])
    .pipe(plugins.clean({ force: true, read: false }))
})

/**********

 * RUN

**********/

gulp.task('default', ['server'])
gulp.task('prod', ['minCss', 'minJs', 'minImages', 'clean'])
