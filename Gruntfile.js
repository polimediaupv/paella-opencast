var path = require('path');

module.exports = function(grunt) { 
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		
		clean: {
			build: ["build"],
		},				
		subgrunt: {
			paella: {
				projects: {
					'submodules/paella': 'build.release'
				}
			}
		},		
		copy: {
			paella: {
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
					'build/resources/plugins/plugins.css',
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
				jshintrc: '.jshintrc'
			},
			dist: [
				'paella-matterhorn/javascript/*.js',
				'paella-matterhorn/plugins/*/*.js'
			]
		},
		csslint: {
			dist: {
				options: {
					import: 2,
					"adjoining-classes": false,
					"box-model": false,
					"ids": false,
					"outline-none": false            
				},
				src: ['paella-matterhorn/plugins/*/*.css']
			}
		},
		cssmin: {
			dist: {
				files: {
					'build/resources/plugins/plugins.css': ['build/resources/plugins/plugins.css']
				}
			}
		},
		
		watch: {
			 debug: {
				 files: [
				 	'paella-matterhorn/ui/**',
				 	'paella-matterhorn/javascript/*.js',
				 	'paella-matterhorn/plugins/*/*.js',
				 	'paella-matterhorn/plugins/*/*.css'
				 ],
				 tasks: ['build.debug']
			},
			release: {
				 files: [
				 	'paella-matterhorn/ui/**',
				 	'paella-matterhorn/javascript/*.js',
				 	'paella-matterhorn/plugins/*/*.js',
				 	'paella-matterhorn/plugins/*/*.css'
				 ],
				 tasks: ['build.release']
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


	grunt.loadNpmTasks('grunt-subgrunt');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-express');

	
	grunt.registerTask('default', ['build.release']);
	grunt.registerTask('checksyntax', ['jshint', 'csslint']);
	
	grunt.registerTask('build.common', ['subgrunt:paella', 'copy:paella', 'concat:dist.js', 'concat:dist.css']);
	grunt.registerTask('build.release', ['build.common', 'uglify:dist', 'cssmin:dist']);
	grunt.registerTask('build.debug', ['build.common']);
	
	grunt.registerTask('server.release', ['build.release', 'express', 'watch:release']);		
	grunt.registerTask('server.debug', ['build.debug', 'express', 'watch:debug']);		
};
