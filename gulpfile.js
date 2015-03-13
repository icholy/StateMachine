
var gulp          = require('gulp'),
    merge         = require('merge-stream'),
    karma         = require('karma').server,
    rimraf        = require('rimraf'),
    uglify        = require('gulp-uglify'),
    typedoc       = require('gulp-typedoc'),
    tslint        = require('gulp-tslint'),
    babel         = require('gulp-babel'),
    sourcemaps    = require('gulp-sourcemaps'),
    typescript    = require('gulp-typescript');

var baseTypeScriptTask = function () {
  return gulp.src('src/*.ts');
};

gulp.task('build', function () {
  var tsResult = baseTypeScriptTask()
      .pipe(sourcemaps.init())
      .pipe(typescript({
        target: 'ES6',
        declarationFiles: true,
        noExternalResolve: true
      }));
  return merge(
    tsResult.js
        .pipe(babel())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build')),
    tsResult.dts.pipe(gulp.dest('build'))
  );
});

gulp.task('lint', function () {
  return baseTypeScriptTask()
      .pipe(tslint())
      .pipe(tslint.report('verbose'))
});

gulp.task('docs', function (done) {
  return baseTypeScriptTask()
      .pipe(typedoc({ out: "docs/" }));
});

gulp.task('watch', function () {
  gulp.watch('src/**/*.ts', ['build']);
});

gulp.task('test_watch', ['watch'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
  }, done);
});

gulp.task('test', ['build'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
  }, done);
});

gulp.task('clean', function () {
  var noop = function () {};
  rimraf('docs/', noop);
  rimraf('build/', noop);
});

gulp.task('dist', ['lint', 'docs', 'build']);
gulp.task('default', ['dist']);

