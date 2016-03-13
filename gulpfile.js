'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var wrench = require('wrench');
var fs = require('fs');
var s3 = require('gulp-s3');
var gzip = require("gulp-gzip");

var options = {
    src: 'src',
    dist: 'dist',
    s3: 'https://s3.amazonaws.com/cuturia/dist',
    tmp: '.tmp',
    e2e: 'e2e',
    errorHandler: function (title) {
        return function (err) {
            gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
            this.emit('end');
        };
    },
    wiredep: {
        directory: 'bower_components',
        exclude: [/jquery/]
    }
};

wrench.readdirSyncRecursive('./gulp').filter(function (file) {
    return (/\.(js|coffee)$/i).test(file);
}).map(function (file) {
    require('./gulp/' + file)(options);
});

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('s3-upload', function () {
    var aws = JSON.parse(fs.readFileSync('./aws.json'));
    gulp.src(['dist/styles/**', 'dist/scripts/**'])
        .pipe(gzip())
        .pipe(s3(aws, {
            uploadPath: "/dist/",
            headers: {
                'x-amz-acl': 'public-read'
            },
            gzippedOnly: true
        }));
});


