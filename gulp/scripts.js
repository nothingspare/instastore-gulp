'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');

var babel = require('gulp-babel');

var $ = require('gulp-load-plugins')();

module.exports = function (options) {
  gulp.task('scripts', function () {
    return gulp.src(options.src + '/app/**/*.js')
        .pipe(babel({
          presets: ['es2015']
        }))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(browserSync.reload({stream: true}))
        .pipe($.size());
  });
};
