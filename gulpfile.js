var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var gulpIf = require('gulp-if');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var fileinclude = require('gulp-file-include');
var markdown = require('markdown');

// Development
gulp.task('fileinclude', function() {
  gulp.src(['app/html/*.html'])
    .pipe(fileinclude({
      filters: {
        markdown: markdown.parse
      }
    }))
    .pipe(gulp.dest('app/')),
    browserSync.reload;
});

gulp.task('sass', function(){
  return gulp.src('app/scss/**/*.scss')
  .pipe(sass())
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
})

gulp.task('browserSync', function(){
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  })
})

gulp.task('watch', ['sass'], function(){
  gulp.watch('app/scss/**/*.scss',['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
  gulp.watch('app/html/*.html',['fileinclude'] );
  gulp.watch('app/html/partial/*.html',['fileinclude'] );
})

gulp.task('default', function(){
  runSequence('sass', 'watch','browserSync');
})


// Prod Build

gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin()))
  .pipe(gulp.dest('dist/images'))
})

gulp.task('fonts', function(){
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})

gulp.task('useref', function(){
  return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js',uglify()))
        .pipe(gulpIf('*.css',cssnano()))
        .pipe(gulp.dest('dist'))
})

gulp.task('clean:dist', function(){
  return del.sync('dist')
})

gulp.task('build', function(callback){
  runSequence('clean:dist','fileinclude',['sass','useref','images','fonts'],
  callback
  )
})
