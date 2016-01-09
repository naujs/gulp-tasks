var Jasmine = require('jasmine')
  , eslint = require('gulp-eslint')
  , babel = require('gulp-babel')
  , exec = require('child_process').exec
  , gutil = require('gulp-util')
  , argv = require('yargs').argv;

var eslintrc = {
  "rules": {
    "indent": [2, 2],
    "quotes": [2, "single"],
    "linebreak-style": [2, "unix"],
    "semi": [2, "always"],
    "strict": 0,
    "array-bracket-spacing": 2,
    "func-style": [2, "declaration"],
    "key-spacing": 2,
    "lines-around-comment": 2,
    "new-cap": 0,
    "max-nested-callbacks": [2, 4],
    "new-parens": 2,
    "no-mixed-spaces-and-tabs": [2, "smart-tabs"],
    "no-nested-ternary": 2,
    "no-spaced-func": 2,
    "no-trailing-spaces": 2,
    "no-redeclare": 2,
    "no-return-assign": 2,
    "no-loop-func": 2,
    "no-extra-bind": 2,
    "comma-spacing": [2, {"before": false, "after": true}],
    "space-before-blocks": [2, "always"],
    "no-underscore-dangle": 0,
    "camelcase": 0
  },
  "env": {
    "es6": true,
    "node": true,
    "browser": false
  },
  "globals": {
    "describe": true,
    "fdescribe": true,
    "it": true,
    "fit": true,
    "beforeEach": true,
    "afterEach": true,
    "module": true,
    "expect": true,
    "spyOn": true,
    "inject": true,
    "jasmine": true,
    "fail": true
  }
};

module.exports = function(gulp) {
  if (!gulp) {
    gulp = require('gulp');
  }

  gulp.task('lint', function() {
    var paths = [
      'src/**/*.js',
      'tests/**/*.js'
    ];
    return gulp.src(paths)
      .pipe(eslint(eslintrc))
      .pipe(eslint.format())
      .pipe(eslint.failOnError());
  });

  gulp.task('test', ['build', 'lint'], function(done) {
    var jasmine = new Jasmine()
      , config = {};

    config.spec_files = [
      'tests/**/*.spec.js'
    ];
    config.spec_dir = '.';
    config.helpers = [
      'node_modules/babel-register/lib/node.js',
      'tests/helpers/**/*.js'
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

  gulp.task('publish', ['push'], function(done) {
    exec('npm publish --access=public', {
      cwd: process.cwd()
    }, function(error, stdout, stderr) {
      if (error) {
        gutil.log(gutil.colors.red(stderr));
        return done(true);
      }
      gutil.log(stdout);
      done();
    });
  });

  gulp.task('push', ['version'], function(done) {
    exec('git push && git push --tags', {
      cwd: process.cwd()
    }, function(error, stdout, stderr) {
      if (error) {
        gutil.log(gutil.colors.red(stderr));
        return done(true);
      }
      gutil.log(stdout);
      done();
    });
  });

  gulp.task('version', ['test'], function(done) {
    var command = 'npm version';

    if (argv.major) {
      command += ' major';
    } else if (argv.minor) {
      command += ' minor';
    } else {
      command += ' patch';
    }

    exec(command, {
      cwd: process.cwd()
    }, function(error, stdout, stderr) {
      if (error) {
        gutil.log(gutil.colors.red(stderr));
        return done(true);
      }
      gutil.log(stdout);
      done();
    });
  });

  gulp.task('default', ['test']);

  return gulp;
}
