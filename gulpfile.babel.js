import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();

gulp.task('bump-version', () => {
  return gulp.src(['./package.json'])
    .pipe($.bump({type: 'patch'}).on('error', $.util.log))
    .pipe(gulp.dest('./'));
});

gulp.task('generate-changelog', () => {
  return gulp.src('CHANGELOG.md')
  .pipe($.conventionalChangelog({
      preset: 'angular'
    }))
  .pipe(gulp.dest('./'));
});

gulp.task('commit-changes', () => {
  return gulp.src('.')
    .pipe($.git.commit('Bumped version number'));
});

gulp.task('push-changes', (cb) => {
  $.git.push('origin', 'master', cb);
});

gulp.task('create-new-tag', (cb) => {
  var version = getPackageJsonVersion();
  $.git.tag(version, 'Created Tag for version: ' + version, function (error) {
    if (error) {
      return cb(error);
    }
    $.git.push('origin', 'master', {args: '--tags'}, cb);
  });
  function getPackageJsonVersion () {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
  };
});



