let gulp = require('gulp')
let gutil = require('gulp-util')
let eslint = require('gulp-eslint')
let mocha = require('gulp-mocha')
let istanbul = require('gulp-istanbul')
let nodemon = require('gulp-nodemon')
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

gulp.task('test-server', () => {
  // return gulp.src('./tests/server/**/*.js')
  //    .pipe(mocha())
  return gulp.src([
    'main.js',
    './server/**/*.js',
    './client/shared/**/*.js'
  ])
      .pipe(istanbul({includeUntested: true}))
      .on('finish', () => {
        gulp.src([
          './tests/server/**/*.js',
          './tests/client/**/*.js'
        ])
        .pipe(mocha({reporter: 'spec'}))
        .pipe(istanbul.writeReports({
          dir: './tests/coverage/server',
          reporters: ['lcov'],
          reportOpts: {dir: './tests/coverage/server'}
        }))
      })
})

gulp.task('test-client', () => {
  // return gulp.src('./tests/client/**/*.js')
  //  .pipe(mocha())
  return gulp.src('./client/**/*.js')
      .pipe(istanbul({includeUntested: true}))
      .on('finish', () => {
        gulp.src([
          './tests/client/**/*.js'
        ])
        .pipe(mocha({reporter: 'spec'}))
        .pipe(istanbul.writeReports({
          dir: './tests/coverage/client',
          reporters: ['lcov'],
          reportOpts: {dir: './tests/coverage/client'}
        }))
      })
})

gulp.task('test', ['test-server', 'test-client'])

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

gulp.task('build-debug', ['lint', 'test-client', 'bundle-debug'])
gulp.task('build', ['lint', 'test', 'bundle-release'])

gulp.task('start', (cb) => {
  let nd = nodemon({
    script: 'main.js',
    watch: ['main.js', './server/**/*.js', './client/shared/**/*.js'],
    nodeArgs: ['--debug']
  })
    .on('restart', ['lint', 'test-server'])
    .on('crash', () => {
      console.error('Server has crashed!\n')
      nd.emit('restart', 10)
    })
})

gulp.task('watch', () => {
  gulp.watch(['./client/src/js/**/*.js'], ['build-debug'])
})

gulp.task('default', ['start', 'watch'])
