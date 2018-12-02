var gulp = require('gulp');
var $ = require('gulp-load-plugins')(); // gulp-開頭的套件不需重複require，使用「 $. 」
// var pug = require('gulp-pug');
// var sass = require('gulp-sass');   // sass and scss
// var plumber = require('gulp-plumber'); // Prevent pipe breaking caused by errors from gulp plugins
// var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
// var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
var gulpSequence = require('gulp-sequence').use(gulp);


var minimist = require('minimist');
var envOptions = {
  string: 'env',
  default: {
    env: 'develop'
  }
}
var options = minimist(process.argv.slice(2), envOptions)
console.log(options)
//（devlop） gulp  
// (production) gulp --env production



gulp.task('clean', function () {
  return gulp.src(['./.tmp', './dist'], {
      read: false
    })
    .pipe($.clean());
})

gulp.task('pug', function () {
  return gulp
    .src('./src/**/[^_]*.pug')
    .pipe($.plumber()) // 出錯後不會停止
    .pipe(
      $.pug({
        pretty: true
      })
    )
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream());
});

gulp.task('sass', function () {
  var plugins = [
    autoprefixer({
      browsers: ['last 5 version', '>5%']
    }),
    // cssnano()
  ];

  return gulp.src('./src/css/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass(
        // {outputStyle: 'compressed'}
      )
      .on('error', $.sass.logError))
    // 此時sass已經編譯完成
    .pipe($.postcss(plugins))
    // .pipe($.if(options.env === 'production', $.minifyCss())) // 在編譯完成後加入minify。因為使用gulp-load-plugins所以"-"需刪除，變成開頭大寫。
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('babel', () => {
  return gulp.src('./src/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['env']
    }))
    .pipe($.concat('main.js'))
    .pipe($.if(options.env === 'production', $.uglify({
      compress: {
        drop_console: true // 移出測試console
      }
    }))) // 在編譯完成後加入uglify
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'));
});

// gulp.task('bower', function () {
//   // return gulp.src(mainBowerFiles())
//     .pipe(gulp.dest('./.tmp/vendors'))
//     .pipe(browserSync.stream());
// });

// Gulp與Bower程式碼串接至src裡面
// gulp.task('vendorJs', ['bower'], function () { //vendorsJs執行前，先執行bower
//   return gulp.src('./.tmp/vendors/**/**.js')
//     .pipe($.concat('vendors.js'))
//     .pipe($.if(options.env === 'production', $.uglify()))
//     .pipe(gulp.dest('./src/js'))
// })


// Minify PNG, JPEG, GIF and SVG images with imagemin
gulp.task('image-min', () =>
  gulp.src('./src/images/*')
  .pipe($.if(options.env === 'production', $.imagemin()))
  .pipe(gulp.dest('./dist/images'))
);

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  })
})

// 監控檔案，當檔案有更新就執行資料夾，下指令gulp watch，將會一直持續監控
gulp.task('watch', function () {
  gulp.watch('./src/css/**/*.scss', ['sass']);
  gulp.watch('./src/**/[^_]*.pug', ['pug']);
  gulp.watch('./src/js/**/*.js', ['babel']);
});

// 一鍵部署到Github Pages
gulp.task('deploy', function () {
  return gulp.src('./dist/**/*')
    .pipe($.ghPages());
});

// 此為發佈用的流程，無需加入browersync跟watch。使用 gulp build --env production 輸出壓縮後的最終成品
gulp.task('sequence', gulpSequence('clean', 'pug', 'sass', 'babel'))
// gulp.task('build', gulp.series('clean', 'pug', 'sass', 'babel', 'vendorJs'))  


// 下指令gulp即可按照下列順序執行gulp
gulp.task('default', ['pug', 'sass', 'babel', 'browser-sync', 'image-min', 'watch']);
// gulp.task('default', ['pug', 'sass', 'babel', 'vendorJs', 'browser-sync', 'image-min', 'watch']);
gulp.task('build', ['sequence']);