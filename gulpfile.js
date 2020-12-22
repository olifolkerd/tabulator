var gulp = require('gulp'),
sass = require('gulp-sass'),
autoprefixer = require('gulp-autoprefixer'),
cssnano = require('gulp-cssnano'),
uglify = require('gulp-uglify'),
uglifyesm = require('gulp-uglify-es').default,
rename = require('gulp-rename'),
concat = require('gulp-concat'),
del = require('del');
include = require('gulp-include'),
sourcemaps = require('gulp-sourcemaps'),
babel = require('gulp-babel'),
plumber = require('gulp-plumber'),
gutil = require('gulp-util'),
insert = require('gulp-insert'),
fs = require('fs');

var version_no = "4.9.3",

version = "/* Tabulator v" + version_no + " (c) Oliver Folkerd */\n";

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

//build css
function styles(){
    return gulp.src('src/scss/**/tabulator*.scss')
    .pipe(sourcemaps.init())
    .pipe(insert.prepend(version + "\n"))
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano({zindex: false}))
    .pipe(insert.prepend(version))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .on('end', function(){ gutil.log('Styles task complete'); })
}

//build tabulator
function tabulator(){
    //return gulp.src('src/js/**/*.js')
    return gulp.src('src/js/core_modules.js')
    .pipe(insert.prepend(version + "\n"))
    //.pipe(sourcemaps.init())
    .pipe(include())
    //.pipe(jshint())
    // .pipe(jshint.reporter('default'))
    .pipe(babel({
        //presets:['es2015']
        compact: false,
        presets: [["env",{
            "targets": {
              "browsers": ["last 4 versions"]
            },
            loose: true,
            modules: false,
        }, ], {  }]
      }))
    .pipe(concat('tabulator.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(insert.prepend(version))
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
    //.pipe(notify({ message: 'Scripts task complete' }));
    .on('end', function(){ gutil.log('Tabulator Complete'); })
    //.on("error", console.log)
}

//build tabulator
function esm(){
    //return gulp.src('src/js/**/*.js')
    return gulp.src('src/js/core_esm.js')
    .pipe(insert.prepend(version + "\n"))
    //.pipe(sourcemaps.init())
    .pipe(include())
    //.pipe(jshint())
    // .pipe(jshint.reporter('default'))
    .pipe(babel({
        //presets:['es2015']
        compact: false,
        presets: [["env",{
            "targets": {
              "browsers": ["last 4 versions"]
            },
            loose: true,
            modules: false,
        }, ], {  }]
      }))
    .pipe(concat('tabulator.es2015.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglifyesm())
    .pipe(insert.prepend(version))
    .pipe(gulp.dest('dist/js'))
    //.pipe(notify({ message: 'Scripts task complete' }));
    .on('end', function(){ gutil.log('ESM Complete'); })
    //.on("error", console.log)
}


//simplified core js
function core(){
    return gulp.src('src/js/core.js')
    .pipe(insert.prepend(version + "\n"))
    .pipe(include())
    .pipe(babel({
        presets: [["env", {
          "targets": {
            "browsers": ["last 4 versions"]
        },
        loose: true,
        modules: false,
        }]
        ]
        }))
    .pipe(concat('tabulator_core.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(insert.prepend(version))
    .pipe(gulp.dest('dist/js'))
    .on('end', function(){ gutil.log('Core complete'); })
}


function modules(){

    var path = __dirname + "/src/js/modules/";

    var files = fs.readdirSync(path);

    var core = ["layout.js", "localize.js", "comms.js"];

    files.forEach(function(file, index){

        if(!core.includes(file)){
            return gulp.src('src/js/modules/' + file)
            .pipe(insert.prepend(version + "\n"))
            .pipe(include())
            .pipe(babel({
                presets: [["env", {
                  "targets": {
                    "browsers": ["last 4 versions"]
                },
                loose: true,
                modules: false,
                }]
                ]
                }))
            .pipe(concat(file))
            .pipe(gulp.dest('dist/js/modules/'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(insert.prepend(version))
            .pipe(gulp.dest('dist/js/modules/'))
            .on('end', function(){gutil.log('module ' + file + ' complete')})
        }
        });

    gutil.log("Modules complete");
}

//make jquery wrapper
function jquery(){
    return gulp.src('src/js/jquery_wrapper.js')
    .pipe(insert.prepend(version + "\n"))
    .pipe(include())
    .pipe(babel({
        presets: [["env", {
          "targets": {
            "browsers": ["last 4 versions"]
        },
        loose: true,
        modules: false,
        }]
        ]
        }))
    .pipe(concat('jquery_wrapper.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(insert.prepend(version))
    .pipe(gulp.dest('dist/js'))
    .on('end', function(){ gutil.log('jQuery wrapper complete'); })
}

function scripts(){
    return Promise.all([tabulator(), core(), esm(), modules(), jquery()]);
}

function devscripts(){
    return Promise.all([tabulator()]);
}

function clean(){
    return del(['dist/css', 'dist/js']);
}

function watch(){
    gulp.series(clean, gulp.series(styles, scripts));
    // Watch .scss files
    gulp.watch('src/scss/**/*.scss', styles);

    // Watch .js files
    gulp.watch('src/js/**/*.js', scripts);
}

//a quick series of builds to test functionality while developing
function dev(){
    // May be not necessary to run a clean and build before the watch
    gulp.series(clean, gulp.series(styles, devscripts));

    // Watch .scss files
    gulp.watch('src/scss/**/*.scss', styles);

    // Watch .js files
    gulp.watch('src/js/**/*.js', devscripts);
}

exports.tabulator = gulp.series(tabulator);
exports.styles = gulp.series(styles);
exports.esm = gulp.series(esm);
exports.core = gulp.series(core);
exports.modules = gulp.series(modules);
exports.jquery = gulp.series(jquery);
exports.scripts = gulp.series(scripts);
exports.clean = gulp.series(clean);
exports.default = gulp.series(clean, gulp.series(styles, scripts));
exports.watch = gulp.series(watch);
exports.dev = gulp.series(dev);