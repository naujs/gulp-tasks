var Jasmine = require('jasmine')
  , eslint = require('gulp-eslint')
  , babel = require('gulp-babel');

module.exports = function(gulp) {
  gulp.task('lint', function() {
    var paths = [
      'src/**/*.js',
      'tests/**/*.js'
    ];
    return gulp.src(paths)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failOnError());
  });

  gulp.task('test', ['lint'], function(done) {
    var jasmine = new Jasmine()
      , config = {};

    config.spec_files = [
      'tests/**/*.spec.js'
    ];
    config.spec_dir = '.';
    config.helpers = [
      'node_modules/babel-register/lib/node.js'
    ];

    jasmine.loadConfig(config);
    jasmine.configureDefaultReporter({
      showColors: true,
      forceExit: true
    });

    jasmine.onComplete(function() {
      done();
    });

    jasmine.execute();
  });

  gulp.task('build', function() {
    return gulp.src('src/**/*.js')
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest('build'));
  });

  gulp.task('default', ['test', 'build']);

  return gulp;
}
