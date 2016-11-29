let gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),

    sourceFile = './client/js/src/game.js',
    destFolder = './client/js/',
    destFile = 'game.js';

gulp.task('es6', () => {
    browserify({
        entries: sourceFile,
        debug: true
    })
    .transform(babelify.configure({
        presets: ["es2015"]
    }))
    .on("error", gutil.log)
    .bundle()
    .on("error", gutil.log)
    .pipe(source(destFile))
    .pipe(gulp.dest(destFolder));
});

gulp.task('watch', () => {
    gulp.watch(["./client/js/src/*.js", "./client/js/src/engine/*.js"], ['es6']);
});

gulp.task('default', ['watch']);
/*
gulp.task('browserify', () => {
    return browserify(sourceFile)
        .bundle()
        .pipe(source(destFile))
        .pipe(gulp.dest(destFolder));
});

gulp.task('watch', () => {
    let bundler = watchify(sourceFile);
    let rebundle = () => {
        return bundler.bundle()
            .pipe(source(destFile))
            .pipe(gulp.dest(destFolder));
    };
    
    bundler.on('update', rebundle);

    return rebundle();
});
*/


//gulp.task('default', ['browserify', 'watch']);