(function () {
  'use strict';

/*------------------------------------*\
 #CSS STYLES TASKS
\*------------------------------------*/

import browserSync from 'browser-sync';

  var gulp = require('gulp'),
      autoprefixer = require('autoprefixer-core'),
      mqpacker = require('css-mqpacker'),
      opacity = require('postcss-opacity'),
      pixrem = require('pixrem'),
      wiredep = require('wiredep').stream,
      reload = browserSync.reload,
      $ = require('gulp-load-plugins')();

  gulp.task('styles', function () {
    var processors = [
      autoprefixer({browsers: ['last 1 version']}),
      mqpacker,
      opacity,
      pixrem
    ];

    return <% if (includeNodeSass) { %>gulp.src('scss/main.scss')
      .pipe($.sass({errLogToConsole: true})) <% } else { %>$.rubySass('scss')
      .pipe($.plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
      }))<% } %>
      .pipe($.postcss(processors))
      .pipe($.minifyCss())
      .pipe($.rename({suffix: '.min'}))
      .pipe(reload({stream: true}))
      .pipe($.size({showFiles: true}))
      .on('error', console.error.bind(console))
      .pipe(gulp.dest('css'));
  }); 
  <% if (includeSprite) { %>
  gulp.task('sprite', function () {
    var spriteData = gulp.src('images/sprite/**/*')
      .pipe($.plumber())
      .pipe($.spritesmith({
        imgName: 'sprite.png',
        imgPath: '../images/sprite.png',
        cssName: '_sprite.scss',
        padding: 5
      }));
    spriteData.img.pipe(gulp.dest('images/'));
    return spriteData.css.pipe(gulp.dest('scss/components/'));
  });<% } %>

  gulp.task('dev', function () {
    browserSync({
      notify: false,
      port: 9000,
      server: {
        baseDir: "./",
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch([
      '*.html',
      'images/**/*',
    ]).on('change', reload);
  
    gulp.watch(['scss/**/*.{css,scss}'], ['styles']); <% if (includeSprite) { %> 
    gulp.watch(['images/sprite/**/*'], ['sprite']); <% } %>
  });
/*------------------------------------*\
 #END OF CSS STYLES TASKS
\*------------------------------------*/

})();

