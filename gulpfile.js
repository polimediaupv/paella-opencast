"use strict"
var gulp = require('gulp');
var clean = require('gulp-clean');
var spawn = require('child_process').spawn;
var mergeStream = require('merge-stream');

var connect = require('gulp-connect');
var serveStatic = require('serve-static');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({secure:false});


gulp.task('paella-opencast:clean', function () {
	return gulp.src('build', {read: false}).pipe(clean());
});


gulp.task('paella-opencast:editor:prepare:source', function(){
	var s1 = gulp.src('node_modules/paella-editor/**').pipe(gulp.dest('build/paella-editor'));	
	var s2 = gulp.src('paella-opencast/plugins-editor/**').pipe(gulp.dest('build/paella-editor/plugins'));
	
	return mergeStream(s1,s2);
	
});

gulp.task('paella-opencast:editor:prepare', ['paella-opencast:editor:prepare:source'], function(cb){
	var cmd_npm = spawn('npm', ['install'], {cwd: 'build/paella-editor', stdio: 'inherit'});
	cmd_npm.on('close', function (code) {
		cb(code);
	});	
});

gulp.task('paella-opencast:editor:compile', ['paella-opencast:editor:prepare'], function(cb){
	var cmd_npm = spawn('node', ['node_modules/gulp/bin/gulp.js', 'editorFiles'], {cwd: 'build/paella-editor'/*, stdio: 'inherit'*/});
	cmd_npm.on('close', function (code) {
		cb(code);
	});	
});




gulp.task('paella-opencast:prepare:source', function(){
	var s1 = gulp.src('node_modules/paellaplayer/**').pipe(gulp.dest('build/paella'));
	var s2 = gulp.src('paella-opencast/plugins/**').pipe(gulp.dest('build/paella/plugins'));

	return mergeStream(s1,s2);
});



gulp.task('paella-opencast:prepare', ['paella-opencast:prepare:source'], function(cb){
	var cmd_npm = spawn('npm', ['install'], {cwd: 'build/paella', stdio: 'inherit'});
	cmd_npm.on('close', function (code) {
		cb(code);
	});
});


gulp.task('paella-opencast:compile.debug', ['paella-opencast:prepare'], function(cb){
	var cmd_npm = spawn('node', ['node_modules/gulp/bin/gulp.js', 'build.debug'], {cwd: 'build/paella'/*, stdio: 'inherit'*/});
	cmd_npm.on('close', function (code) {
		cb(code);
	});	
});

gulp.task('paella-opencast:compile.release', ['paella-opencast:prepare'], function(cb){
	var cmd_npm = spawn('node', ['node_modules/gulp/bin/gulp.js', 'build.release'], {cwd: 'build/paella'/*, stdio: 'inherit'*/});
	cmd_npm.on('close', function (code) {
		cb(code);
	});
});


gulp.task('paella-opencast:build', ["paella-opencast:compile.debug", "paella-opencast:editor:compile"], function(){
	return gulp.src([
		'build/paella/build/player/**',
		'build/paella-editor/build/editor-files/**',
		'paella-opencast/ui/**'
		
	]).pipe(gulp.dest('build/paella-opencast'));	
});


gulp.task('paella-opencast:server:rebuild', ['paella-opencast:build'], function(){
	return connect.reload();
});

gulp.task('paella-opencast:server:watch', function () {
	return gulp.watch(['paella-opencast/plugins/**', 'paella-opencast/plugins-editor/**'], ['paella-opencast:server:rebuild']);
});

gulp.task('paella-opencast:server:run', function() {
	return connect.server({
		port: 8000,
		middleware: function(connect, opt) {
			return [
				[ "/paella/ui", serveStatic('build/paella-opencast', {'index': ['index.html']}) ],
				[ "/", function(req, res, next) {
						//proxy.web(req, res, { target: 'http://engage.opencast.org/' });
						proxy.web(req, res, { target: 'http://engage.videoapuntes.upv.es:8080/' });						
						//proxy.web(req, res, { target: 'https://opencast-dev.uni-koeln.de/' });	
					}
				]
			]
		},
		livereload: true
	});
});

gulp.task('paella-opencast:server', ['paella-opencast:server:run', 'paella-opencast:server:watch']);

gulp.task('default', ['paella-opencast:build']);	


