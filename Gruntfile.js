var path = require('path');

module.exports = function(grunt) { 
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		
		copy: {
			dist: {
				files: [
					// Basic Paella
					{expand: true, cwd: 'submodules/paella/build/player', src: ['config/**', 'javascript/**', 'resources/**', 'player.swf'], dest: 'build/'},			
					// Paella Matterhorn
					{expand: true, cwd: 'paella-matterhorn/ui', src: ['**'], dest: 'build/'},			
				]
			}
		},
		concat: {
			options: {
				separator: '\n',
				process: function(src, filepath) {
					return '/*** File: ' + filepath + ' ***/\n' + src;
				}
			},
			'dist.js': {
				src: [
					'paella-matterhorn/javascript/*.js',
					'paella-matterhorn/plugins/*/*.js'
				],
				dest: 'build/javascript/paella_matterhorn.js'
			},
			'dist.css': {
				src: [
					'paella-matterhorn/plugins/*/*.css'
				],
				dest: 'build/resources/plugins/plugins.css'
			}
		},
		
		uglify: {
			options: {
				banner: '/*\n' +
						'	Paella HTML 5 Multistream Player for Matterhorn\n' +
						'	Copyright (C) 2013  Universitat Politècnica de València' +
						'\n'+
						'	File generated at <%= grunt.template.today("dd-mm-yyyy") %>\n' +
						'*/\n',
				mangle: false
			},
			dist: {
				files: {
					'build/javascript/paella_matterhorn.min.js': ['build/javascript/paella_matterhorn.js']
				}
			}
		},
		jshint: {
			options: {
				jshintrc: 'jshintrc'
			},
			dist: [
				'paella-matterhorn/javascript/*.js',
				'paella-matterhorn/plugins/*/*.js'
			]
		},
		
		
		watch: {
			 dist: {
				 files: [
				 	'index.html',
				 	'extended.html',
				 	'src/*.js',
				 	'plugins/*/*.js',
				 	'plugins/*/*.css'
				 ],
				 tasks: ['dist']
			}
		},		
		express: {
			dist: {
		      options: {
			      port:3000,
			      bases: 'build',
			      server: path.resolve('./server')
		      }
		  }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-express');	
	
	
	grunt.registerTask('default', ['dist']);
	grunt.registerTask('checksyntax', ['jshint']);
	
	grunt.registerTask('dist', ['copy:dist', 'concat:dist.js', 'concat:dist.css', 'uglify:dist']);	
	grunt.registerTask('server', ['express', 'watch:dist']);
		
};