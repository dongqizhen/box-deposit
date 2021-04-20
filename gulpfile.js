var gulp = require('gulp');
var uglify = require('gulp-uglify');
// 新建一个‘script’任务用于压缩js文件
gulp.task('script', function () {
  // 找到需要压缩的文件
  return (
    gulp
      .src('./main/miniprogram_npm/lodash/index.js')
      // 压缩文件
      .pipe(uglify())
      // 另存压缩后文件
      .pipe(gulp.dest('index'))
  );
});
gulp.task('default', gulp.series('script'));
