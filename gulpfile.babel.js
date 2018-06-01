// Import Gulp

import gulp from 'gulp'

// Import plugins loader

import gulpLoadPlugins from 'gulp-load-plugins'

// Import Browser-sync

import browserSync from 'browser-sync'

// Import elements to compile es6

import babelify from 'babelify'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import watchify from 'watchify'

// Launch plugins loader as $

const $ = gulpLoadPlugins()

// Create session of browser-sync

browserSync.create()

// Path

const config =
{
  src: 'src',
  dist: 'dist'
}

const message = {
  compiled: '<%= file.relative %>: file compiled',
  exported: '<%= file.relative %>: file exported',
  transpiled: '<%= file.relative %>: file transpiled',
  minified: '<%= file.relative %>: file minified',
  clean: '<%= file.relative %>: file cleaning',
  error: '<%= error.message %>'
}

/**********

 * DEVELOPMENT

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
    .pipe($.plumber())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.sass())
    .on('error', $.notify.onError({
      title: 'SASS',
      message: message.error,
      sound: 'beep'
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))

    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(`${config.dist}/css`))
    .pipe(browserSync.stream())
    .pipe($.notify({
      title: 'SASS',
      message: message.compiled,
      sound: 'beep'
    }))
})

// SCRIPTS

let bundler = null
const bundle = () => {
  bundler.bundle()
    .pipe($.plumber())
    .on('error', $.notify.onError({
      title: 'Scripts',
      message: message.error,
      sound: 'beep'
    }))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(`${config.dist}/js`))
    .pipe(browserSync.stream())
    .pipe($.notify({
      title: 'Scripts',
      message: message.transpiled,
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
    .pipe($.plumber())
    .on('error', $.notify.onError({
      title: 'Move assets',
      message: message.error,
      sound: 'beep'
    }))
    .pipe(gulp.dest(`${config.dist}/assets`))
    .pipe(browserSync.stream())
    .pipe($.notify({
      title: 'Move assets',
      message: message.exported,
      sound: 'beep'
    }))
})

// MOVE PAGES

gulp.task('movePages', () => {
  return gulp.src(`${config.src}/**/*.html`)
    .pipe($.plumber())
    .on('error', $.notify.onError({
      title: 'Move pages',
      message: message.error,
      sound: 'beep'
    }))
    .pipe(gulp.dest(`${config.dist}`))
    .pipe(browserSync.stream())
    .pipe($.notify({
      title: 'Move pages',
      message: message.exported,
      sound: 'beep'
    }))
})

/**********

 * PRODUCTION

**********/

// MINIFY CSS
gulp.task('minCss', () => {
  return gulp.src(`${config.src}/css/styles.css`)
    .pipe($.cssnano())
    .on('error', $.notify.onError({
      title: 'Minify SCSS',
      message: message.error,
      sound: 'beep'
    }))
    .pipe(gulp.dest(`${config.dist}/css`))
    .pipe($.notify({
      title: 'Minify SCSS',
      message: message.minify,
      sound: 'beep'
    }))
})

// MINFIFY JS

gulp.task('minJs', () => {
  return gulp.src(`${config.src}/js/bundle.js`)
    .pipe($.uglify())
    .on('error', $.notify.onError({
      title: 'Minify JS',
      message: message.error,
      sound: 'beep'
    }))
    .pipe(gulp.dest(`${config.dist}/js`))
    .pipe($.notify({
      title: 'Minify JS',
      message: message.minify,
      sound: 'beep'
    }))
})

// MINIFY IMAGES

gulp.task('minImages', () => {
  return gulp.src(`${config.dist}/assets/img/**/*.+(png|jpg|jpeg|gif|svg)`)
    .pipe($.imagemin())
    .on('error', $.notify.onError({
      title: 'Minfiy images',
      message: message.error,
      sound: 'beep'
    }))
    .pipe(gulp.dest(`${config.dist}/assets/img`))
    .pipe($.notify({
      title: 'Minify images',
      message: message.minify,
      sound: 'beep'
    }))
})

// REMOVE MAPS

gulp.task('clean', () => {
  return gulp.src([ `${config.dist}/js/bundle.js.map`, `${config.dist}/css/styles.css.map` ])
    .pipe($.clean({ force: true, read: false }))
    .on('error', $.notify.onError({
      title: 'Clean',
      message: message.error,
      sound: 'beep'
    }))
    .pipe($.notify({
      title: 'Clean',
      message: message.clean,
      sound: 'beep'
    }))
})

/**********

 * RUN

**********/

gulp.task('default', ['server'])
gulp.task('prod', ['minCss', 'minJs', 'minImages', 'clean'])
