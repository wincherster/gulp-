// var gulp = require('gulp');
// var concat = require('gulp-concat'); // 合并文件
// var uglify = require('gulp-uglify'); // 压缩文件
// var cleanCSS = require('gulp-clean-css'); // css文件
// var imagemin = require('gulp-imagemin'); // img文件
// var htmlmin = require('gulp-htmlmin'); // html文件
// var browserSync = require('browser-sync').create(); // 浏览器插件
// var reload = browserSync.reload;

// // 启用静态服务器
// gulp.task('default',['jsmin','cssmin','htmlmin','imagemin'],function(){

// 	browserSync.init({
//         server: {
//             baseDir: "./src"
//         }
//     });

// 	// 监控文件变化 -> 执行任务 -> 刷新浏览器
// 	gulp.watch([
// 		'src/static/css/*.css',
// 		'src/static/js/*.js',
// 		'src/static/img/*',
// 		'src/*.html'
// 	], [
// 		'jsmin',
// 		'cssmin',
// 		'imagemin',
// 		'htmlmin'
// 	]).on('change', reload);

// });

// // js 先合并，后压缩
// gulp.task('jsmin',function(){
// 	gulp.src(['src/static/js/*.js'])
// 		.pipe(concat('index.js'))
// 		.pipe(uglify())
// 		.pipe(gulp.dest('dist/static/js'));
// });

// // css压缩
// gulp.task('cssmin',function(){
// 	gulp.src('src/static/css/*.css')
// 		.pipe(cleanCSS({compatibility: 'ie8'}))
// 		.pipe(concat('index.css'))
// 		.pipe(gulp.dest('dist/static/css'))
// })

// // 图片压缩
// gulp.task('imagemin',function(){

// 	gulp.src('src/static/img/*')
// 		.pipe(imagemin())
// 		.pipe(gulp.dest('dist/static/img'))

// })

// // html压缩
// gulp.task('htmlmin',function(){

// 	gulp.src(['src/*.html'])
// 		.pipe(htmlmin({collapseWhitespace: true}))
// 		.pipe(gulp.dest('dist'))

// })


var gulp = require('gulp');
var connect = require('gulp-connect');

// var watch = require("gulp-watch")//引入watch模块

var concat = require('gulp-concat'); // 合并文件
var uglify = require('gulp-uglify'); // 压缩文件
var cleanCSS = require('gulp-clean-css'); // css文件
var imagemin = require('gulp-imagemin'); // img文件
var htmlmin = require('gulp-htmlmin'); // html文件
var gutil = require('gulp-util'); // 输出错误日志
var babel = require('gulp-babel'); // babel 转移 es6
var proxy = require('http-proxy-middleware');
var browserSync = require('browser-sync').create(); // 浏览器插件
var assetRev = require('gulp-asset-rev'),
	runSequence = require('run-sequence'),
	rev = require('gulp-rev'),
	revCollector = require('gulp-rev-collector'); // 替换文件引用链接
var reload = browserSync.reload;


// 添加版本号 2019-03-04
var cssSrc = './src/static/css/*.css',
	jsSrc = './src/static/js/*.js';
gulp.task('revCss', function () {
	return gulp.src(cssSrc)
		.pipe(rev())
		.pipe(gulp.dest('test/css'))
		.pipe(rev.manifest())
		.pipe(gulp.dest('test/css'));
});

//js生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revJs', function () {
	return gulp.src(jsSrc)
		.pipe(rev())
		.pipe(gulp.dest('test/js'))
		.pipe(rev.manifest())
		.pipe(gulp.dest('test/js'));
});

//Html替换css、js文件版本
gulp.task('revHtml', function () {
	// 这里的View/*.html是项目html文件路径，如果gulpfile.js和html文件同在一级目录下，修改为return gulp.src(['rev/**/*.json', '*.html']);
	return gulp.src(['test/**/*.json', './src/*.html'])
		.pipe(revCollector())
		.pipe(gulp.dest('test')); // 注意这里是生成的新的html文件，如果设置为你的项目html文件所在文件夹，会覆盖旧的html文件，若上面的View/*.html修改了，这里也要相应修改，如果gulpfile.js和html文件同在一级目录下，修改为  .pipe(gulp.dest(''));
});

//检查js语法
gulp.task('jslint', function () {
	return gulp.src(jsSrc)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// 2019-03-04 重命名 测试可以
gulp.task('jstest', function () {
	console.log('js 压缩');
	gulp.src(['./src/static/js/index.js'])
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(uglify())
		.on('error', function (err) {
			gutil.log(gutil.colors.red('[Error]'), err.toString());
		})
		.pipe(gulp.dest('test/js'));
});

// css压缩
gulp.task('csstest', function () {
	gulp.src('src/static/css/*.css')
		.pipe(cleanCSS({
			compatibility: 'ie8'
		}))
		.pipe(gulp.dest('test/css'))
})

// 开发构建
gulp.task('test', function (done) {
	condition = false;
	runSequence( //需要说明的是，用gulp.run也可以实现以上所有任务的执行，只是gulp.run是最大限度的并行执行这些任务，而在添加版本号时需要串行执行（顺序执行）这些任务，故使用了runSequence.
		// ['assetRev'],
		['revCss'],
		['revJs'],
		['revHtml'],
		// ['csstest'],
		// ['jstest'],
		done);
});
// 添加版本号 end



// 2019-03-06 测试有效
// 启用静态服务器
gulp.task('default', ['jsmin', 'cssmin', 'htmlmin'], function () {
	console.log('gulp runing...');
	browserSync.init({
		server: {
			baseDir: "./src"
		}
	});
	// 监控文件变化 -> 执行任务 -> 刷新浏览器
	gulp.watch([
		'src/static/css/*.css',
		'src/static/js/*.js',
		'src/*.html'
	], [
		'jsmin',
		'cssmin',
		'htmlmin'
	]).on('change', reload);
});

// js 先合并，后压缩
gulp.task('jsmin', function () {
	console.log('js 压缩');
	// gulp.src(['src/static/js/index.js'])
	gulp.src(['src/static/js/**/*.js'])
		// .pipe(babel({
		// 	presets: ['es2015']
		// }))
		// .pipe(uglify())
		// .pipe(gulp.dest('dist/static/js'));

		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(uglify())
		.on('error', function (err) {
			gutil.log(gutil.colors.red('[Error]'), err.toString());
		})
		.pipe(gulp.dest('dist/static/js'));
});

// json 文件压缩
gulp.task('jsonmin', function () {
	console.log('json 压缩');
	gulp.src(['src/static/data/**/*.json'])
		.pipe(uglify())
		.pipe(gulp.dest('dist/static/data'));
});

// css压缩
gulp.task('cssmin', function () {
	gulp.src('src/static/css/*.css')
		.pipe(cleanCSS({
			compatibility: 'ie8'
		}))
		.on('error', function (err) {
			gutil.log(gutil.colors.red('[Error]'), err.toString());
		})
		.pipe(gulp.dest('dist/static/css'))
})

// 图片压缩
gulp.task('imagemin', function () {
	gulp.src('src/static/img/*')
		// .pipe(imagemin())
		.on('error', function (err) {
			gutil.log(gutil.colors.red('[Error]'), err.toString());
		})
		.pipe(gulp.dest('dist/static/img'))
})

// html压缩
gulp.task('htmlmin', function () {
	gulp.src(['src/*.html'])
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(gulp.dest('dist'))
})

// 2019-03-06 测试有效 end




// 2019-03-06 完成自动刷新 和 本地服务启动
// 监听修改 刷新
gulp.task('htmlReload', function(){
	// gulp.watch('./src/**/*.+(html|js|css|json)')
	gulp.src('./src/*.html')
	.pipe(connect.reload());
});

// 启动本地服务 2019-03-04
// 建立连接
gulp.task('connect', function () {
	connect.server({
		port: 80, // 默认开启 8080
		livereload: true, // 自动刷新
		root: './src',
		// host: 'm.healthjd.com',
		middleware: function (connect, opt) {
			return [
				// 设置反向代理
				// proxy('/client', {
				// 	target: 'http://api.healthjd.com',
				// 	changeOrigin: true
				// })
			]
		}
	});
})

//定义看守任务
gulp.task('watch', function () {
	gulp.watch('./src/*.html', ['htmlReload']);  //监听html目录下所有文件
});

// 启动本地服务
gulp.task('dev',['watch', 'htmlReload', 'connect'], function () {
	console.log('dev runing...')
})

// 2019-03-06 end


// gulp.task('browserSync', function() {
// var middleware = proxyMiddleware('/client', {
// target: 'http://api.healthjd.com',
// changeOrigin: true, // for vhosted sites, changes host header to match to target's host
// logLevel: 'debug',
// pathRewrite: {
// // '^/epay_www': '/epay_www/'
// // '^/epay_passport': '/epay_passport/'
// // '^/companyService': '/companyService'
// }
// });
// /**
// * Add the proxy to browser-sync
// */
// browserSync.init({
// server: {
// baseDir: './src',
// port: 80,
// middleware: [middleware],
// },
// startPath: '/'
// });
// });
// gulp.task('watch', function() {
// gulp.watch('src/**/*.+(html|js|css|json)')
// .on('change', reload);
// });
// gulp.task('dev-back',['browserSync', 'watch'],function(){
// console.log('gulp dev...');
// });


// 手动打包 任务
gulp.task('build', ['jsmin', 'jsonmin', 'cssmin', 'imagemin', 'htmlmin'], function () {
	console.log('gulp building...');
});