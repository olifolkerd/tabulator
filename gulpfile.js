var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del');


    gulp.task('styles', function() {
      return gulp.src('src/scss/**/tabulator*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('dist/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({ message: 'Styles task complete' }));
    });

    gulp.task('scripts', function() {
     	//return gulp.src('src/js/**/*.js')
      	return gulp.src('src/js/core.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('tabulator.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({ message: 'Scripts task complete' }));
    });

    gulp.task('clean', function() {
      //  return del(['dist/css', 'dist/js']);
    });


    gulp.task('default', ['clean'], function() {
        gulp.start('styles', 'scripts');
    });


    gulp.task('watch', function() {

      // Watch .scss files
      gulp.watch('src/styles/**/*.scss', ['styles']);

      // Watch .js files
      gulp.watch('src/scripts/**/*.js', ['scripts']);

    });