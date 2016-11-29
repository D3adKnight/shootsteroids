let gulp = require('gulp')
let gutil = require('gulp-util')
let eslint = require('gulp-eslint')
let mocha = require('gulp-mocha')
let browserify = require('browserify')
let babelify = require('babelify')
let source = require('vinyl-source-stream')

let sourceFile = './client/src/js/game.js'
let destFolder = './public/js/'
let destFile = 'game.js'

gulp.task('lint', () => {
  return gulp.src([
    './client/src/js/**/*.js',
    './server/**/*.js',
    './main.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('test', () => {
  gulp.src('./tests/**/*.js')
    .pipe(mocha())
})

gulp.task('bundle-debug', () => {
  browserify({
    entries: sourceFile,
    debug: true
  })
    .transform(babelify.configure({
      presets: ['latest']
    }))
    .on('error', gutil.log)
    .bundle()
    .on('error', gutil.log)
    .pipe(source(destFile))
    .pipe(gulp.dest(destFolder))
})

gulp.task('bundle-release', () => {
  browserify({
    entries: sourceFile
  })
    .transform(babelify.configure({
      presets: ['latest']
    }))
    .on('error', gutil.log)
    .bundle()
    .on('error', gutil.log)
    .pipe(source(destFile))
    .pipe(gulp.dest(destFolder))
})

gulp.task('build-debug', ['lint', 'test', 'bundle-debug'])
gulp.task('build', ['lint', 'test', 'bundle-release'])

gulp.task('watch', () => {
  gulp.watch(['./client/src/js/**/*.js', '/server/**/*.js', './main.js'], ['build-debug'])
})

gulp.task('default', ['watch'])
