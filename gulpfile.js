/**
 * Created by TomCao on 15/6/8.
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean');

gulp.task('minifyjs', function() {
    return gulp.src('lib/*.js')
        .pipe(uglify())    //合并所有js到main.js
        .pipe(rename('store_extra.min.js')) //重命名
        .pipe(gulp.dest('./'));    //输出main.js到文件夹
});

gulp.task('clean',function(){
    return gulp.src('./store_extra.min.js')
        .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    gulp.start('minifyjs');
})