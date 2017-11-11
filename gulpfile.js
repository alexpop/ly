// Include gulp
var gulp = require('gulp');
var server = require('gulp-server-livereload');

// Start the web server
gulp.task('serve', function() {
  gulp.src('./')
    .pipe(server({
      livereload: true,
      open: true,
      host: 'localhost',
      port: 9000,
      middleware: function(req, res, next) {
        console.log('gulppppp');
      }
    }));
});


// default task used when running `gulp`
gulp.task('default', ['serve']);
