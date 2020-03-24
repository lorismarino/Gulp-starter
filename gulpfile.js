/* eslint-disable */
const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const webpack = require('webpack-stream')
const plugins = require('gulp-load-plugins')()
const del = require('del')

// Folders
const folders = {
  src: 'src/',
  dist: 'dist/'
}

// Messages
const message = {
  compiled: "<%= file.relative %> a été compilé.",
  compiledMinified: "<%= file.relative %> a été compilé et minifié.",
  exported: "<%= file.relative %> a été exporté",
  transpiled: "<%= file.relative %> a été transpilé",
  minified: "<%= file.relative %> a été minifié",
  clean: "<%= file.relative %>: a été supprimé",
  error: "<%= error.message %>"
}

/******
 * Development
 */

// Server

const server = () => {
  browserSync.init({
    server: folders.dist,
    open: false,
  })

  console.log('\n\x1b[33m%s\x1b[0m', 'HERE WE GO !!!\n');

  gulp.watch(`${folders.src}assets/scss/**/*.scss`, styles)
  gulp.watch(`${folders.src}assets/js/**/*.js`, scripts)
  gulp.watch(`${folders.src}assets/sprite/**/*.svg`, sprite)
  gulp.watch(`${folders.src}assets/img/**/*.+(png|jpg|jpeg|gif|svg)`, images)
  gulp.watch(`${folders.src}pages/**/*.+(html|php)`, pages)

  gulp.watch(`${folders.dist}assets/img/sprite.svg`).on('change', browserSync.reload)
  gulp.watch(`${folders.dist}assets/img/**/*.+(png|jpg|jpeg|gif|svg)`).on('change', browserSync.reload)
}

// Compile scss and add autoprefixer
const styles = () => {
  return gulp.src(`${folders.src}assets/scss/main.scss`)
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass()
      .on("error", plugins.notify.onError({
        message: message.error,
        title: "Erreur de compilation scss"
      }))
    )
    .pipe(plugins.autoprefixer())
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(`${folders.dist}assets/css`))
    .pipe(plugins.notify({
      message: message.compiled,
      title: "Compilation scss"
    }))
    .pipe(browserSync.stream())
}


// Transpiling es6 modules
const scripts = () => {
  return gulp.src(`${folders.src}assets/js/main.js`)
    .pipe(plugins.plumber())
    .pipe(webpack({
      output: {
        filename: 'main.js'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      mode: 'development',
      devtool: '#inline-source-map'
    }))
    .pipe(gulp.dest(`${folders.dist}assets/js`))
    .pipe(plugins.notify({
      message: message.transpiled,
      title: "Transpilation js"
    }))
    .pipe(browserSync.stream())
}

// Create sprite
const sprite = () => {
  return gulp.src(`${folders.src}assets/sprite/**/*.svg`)
    .pipe(plugins.plumber())
    .pipe(plugins.svgSprite({
      shape: {
        id: {
          separator: ''
        }
      },
      mode: {
        symbol: {
          dest: './',
          sprite: 'sprite.svg'
        }
      }
    }))
    .pipe(gulp.dest(`${folders.dist}assets/img`))
}

// Move images
const images = () => {
  return gulp.src(`${folders.src}assets/img/**/*.+(png|jpg|jpeg|gif|svg)`)
    .pipe(plugins.plumber())
    .pipe(gulp.dest(`${folders.dist}assets/img`))
    .pipe(plugins.notify({
      message: message.exported,
      title: "Export images"
    }))
}

// Move fonts
const fonts = () => {
  return gulp.src(`${folders.src}assets/fonts/**/*.{eot,otf,ttf,woff,woff2,svg}`)
    .pipe(plugins.plumber())
    .pipe(gulp.dest(`${folders.dist}assets/fonts`))
    .pipe(plugins.notify({
      message: message.exported,
      title: "Export fonts"
    }))
}

// Move pages
const pages = () => {
  return gulp.src([`${folders.src}pages/*.html`, `${folders.src}pages/*.php`])
    .pipe(plugins.plumber())
    .pipe(plugins.twig({ extname: true }))
    .pipe(gulp.dest(`${folders.dist}`))
    .pipe(plugins.notify({
      message: message.exported,
      title: "Export pages"
    }))
    .pipe(browserSync.stream())
}


/******
 * Production
 */

// Clean dist
const clean = () => {
  return del(`${folders.dist}`)
}

// Compile scss, add autoprefixer and minify
const minStyles = () => {
  return gulp.src(`${folders.src}assets/scss/**/*.scss`)
    .pipe(plugins.sass()
      .on("error", plugins.notify.onError({
        message: message.error,
        title: "Erreur de compilation scss"
      }))
    )
    .pipe(plugins.autoprefixer())
    .pipe(plugins.cleanCss())
    .pipe(gulp.dest(`${folders.dist}assets/css`))
    .pipe(plugins.notify({
      message: message.compiledMinified,
      title: "Minification css"
    }))
}

// Transpile and minify es6
const minScripts = () => {
  return gulp.src(`${folders.src}assets/js/main.js`)
    .pipe(plugins.plumber())
    .pipe(webpack({
      output: {
        filename: 'main.js'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/env']
              }
            }
          }
        ]
      },
      mode: 'production'
    }))
    .pipe(gulp.dest(`${folders.dist}assets/js`))
    .pipe(plugins.notify({
      message: message.exported,
      title: "Export images"
    }))
}

// Minify images
const minImages = () => {
  return gulp.src(`${folders.src}assets/img/**/*`)
    .pipe(plugins.imagemin({ verbose: true }))
    .pipe(gulp.dest(`${folders.dist}assets/img`))
}

exports.default = gulp.series(gulp.parallel(styles, scripts, sprite, images, fonts, pages), server)
exports.build = gulp.series(clean, gulp.parallel(minStyles, minScripts, sprite, minImages, fonts, pages))
