var gulp = require('gulp');
var concat = require('gulp-concat'); // 合并文件
var uglify = require('gulp-uglify'); // 压缩文件
var cleanCSS = require('gulp-clean-css'); // css文件
var imagemin = require('gulp-imagemin'); // img文件
var htmlmin = require('gulp-htmlmin'); // html文件
var browserSync = require('browser-sync').create(); // 浏览器插件
var reload = browserSync.reload;

// 启用静态服务器
gulp.task('default',['jsmin','cssmin','htmlmin','imagemin'],function(){

	browserSync.init({
        server: {
            baseDir: "./src"
        }
    });

	// 监控文件变化 -> 执行任务 -> 刷新浏览器
	gulp.watch([
		'src/static/css/*.css',
		'src/static/js/*.js',
		'src/static/img/*',
		'src/*.html'
	], [
		'jsmin',
		'cssmin',
		'imagemin',
		'htmlmin'
	]).on('change', reload);

});

// js 先合并，后压缩
gulp.task('jsmin',function(){
	gulp.src(['src/static/js/*.js'])
		.pipe(concat('index.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/static/js'));
});

// css压缩
gulp.task('cssmin',function(){
	gulp.src('src/static/css/*.css')
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(concat('index.css'))
		.pipe(gulp.dest('dist/static/css'))
})

// 图片压缩
gulp.task('imagemin',function(){

	gulp.src('src/static/img/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/static/img'))

})

// html压缩
gulp.task('htmlmin',function(){

	gulp.src(['src/*.html'])
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('dist'))

})







