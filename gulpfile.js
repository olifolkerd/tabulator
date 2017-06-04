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
    include = require('gulp-include'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util');

    var gulp_src = gulp.src;
    gulp.src = function() {
      return gulp_src.apply(gulp, arguments)
        .pipe(plumber(function(error) {
          // Output an error message
          gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
          // emit the end event, to properly end the task
          this.emit('end');
        })
      );
    };


    gulp.task('styles', function() {
      return gulp.src('src/scss/**/tabulator*.scss')
     	.pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer('last 4 version'))
        .pipe(gulp.dest('dist/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        //.pipe(notify({ message: 'Styles task complete' }));
        .on('end', function(){ gutil.log('Styles task complete'); })
    });

    gulp.task('scripts', function() {
     	//return gulp.src('src/js/**/*.js')
      	return gulp.src('src/js/jquery_wrapper.js')
      	//.pipe(sourcemaps.init())
      	.pipe(include())
        //.pipe(jshint())
       // .pipe(jshint.reporter('default'))
        .pipe(babel({
         	//presets:['es2015']
         	presets: [["env", {
         	      "targets": {
         	        "browsers": ["last 4 versions"]
         	      }
         	    }]
         	  ]
       	}))
        .pipe(concat('tabulator.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
       // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        //.pipe(notify({ message: 'Scripts task complete' }));
        .on('end', function(){ gutil.log('Scripts task complete'); })
        //.on("error", console.log)
    });

    gulp.task('clean', function() {
        return del(['dist/css', 'dist/js']);
    });


    gulp.task('default', ['clean'], function() {
        gulp.start('styles', 'scripts');
    });


    gulp.task('watch', function() {

      // Watch .scss files
      gulp.watch('src/scss/**/*.scss', ['styles']);

      // Watch .js files
      gulp.watch('src/js/**/*.js', ['scripts']);

    });