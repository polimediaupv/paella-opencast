var path = require('path');

module.exports = function(grunt) { 
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		
		clean: {
			build: ["build"]
		},
		update_submodules: {
	        default: {
	            options: {
	                // default command line parameters will be used: --init --recursive
	            }
	        }
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
					{expand: true, cwd: 'submodules/paella/build/player', src: ['localization/**', 'config/**', 'javascript/**', 'resources/**', 'player.swf'], dest: 'build/'},			
					// Paella Matterhorn
					{expand: true, cwd: 'paella-matterhorn/ui', src: ['**'], dest: 'build/'},
					{expand: true, src:'plugins/*/resources/**', dest: 'build/resources/style/',
						rename: function (dest, src) { return dest+src.split('/').splice(3).join('/'); }
					}					
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
			'less':{
				src: [
					'paella-matterhorn/plugins/*/*.less',
					'submodules/paella/resources/style/defines.less'
				],
				dest: 'build/temp/matterhorn-style.less'
			},			
			'paella_matterhorn.js': {
				src: [
					'paella-matterhorn/javascript/*.js',
					'paella-matterhorn/plugins/*/*.js'
				],
				dest: 'build/javascript/paella_matterhorn.js'
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
					'build/javascript/paella_matterhorn.js': ['build/javascript/paella_matterhorn.js']
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
		less: {
			development: {
				options: {
					paths: [ "css" ]
				},
				modifyVars: {
					titleColor: '#AAAAFF'
				},
				files:{
					"build/resources/style/matterhorn-style.css": "build/temp/matterhorn-style.less"
				}
			},
			production: {
				options:{
					paths: [ "css" ]
				},
				modifyVars: {
					titleColor: '#FF0000'
				},
				files:{
					"build/resources/style/matterhorn-style.css": "build/temp/matterhorn-style.less"
				}
			}
		},		
		cssmin: {
			dist: {
				files: {
					'build/resources/style/matterhorn-style.css': ['build/resources/style/matterhorn-style.css']
				}
			}
		},
		jsonlint: {
			paella: {
				src: [	'package.json',
						'paella-matterhorn/ui/config/*.json',
						'paella-matterhorn/plugins/*/localization/*.json',
						'paella-matterhorn/localization/*.json'
				]
			}
		},
		
		'merge-json': {
			'i18n': {
				files: {
					'build/localization/paella_en.json': [
						'build/localization/paella_en.json',
						'paella-matterhorn/localization/*en.json',
						'paella-matterhorn/plugins/*/localization/*en.json' 
					],
					'build/localization/paella_es.json': [
						'build/localization/paella_es.json',
						'paella-matterhorn/localization/*es.json', 
						'paella-matterhorn/plugins/*/localization/*es.json' 
					]
				}
			}
		},
				
		watch: {
			 debug: {
				 files: [
				 	'paella-matterhorn/ui/**',
				 	'paella-matterhorn/javascript/*.js',
				 	'paella-matterhorn/plugins/**'
				 ],
				 tasks: ['build.debug']
			},
			release: {
				 files: [
				 	'paella-matterhorn/ui/**',
				 	'paella-matterhorn/javascript/*.js',
				 	'paella-matterhorn/plugins/**'
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

	grunt.loadNpmTasks('grunt-merge-json');
	grunt.loadNpmTasks('grunt-update-submodules');
	grunt.loadNpmTasks('grunt-subgrunt');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-jsonlint');
	grunt.loadNpmTasks('grunt-express');

	
	grunt.registerTask('default', ['build.release']);
	grunt.registerTask('checksyntax', ['concat:less','less:production', 'jshint', 'jsonlint']);
	
	grunt.registerTask('build.common', ['update_submodules', 'checksyntax', 'subgrunt:paella', 'copy:paella', 'concat:paella_matterhorn.js', 'merge-json']);
	
	grunt.registerTask('build.release', ['build.common', 'uglify:dist', 'cssmin:dist']);
	grunt.registerTask('build.debug', ['build.common']);
	
	grunt.registerTask('server.release', ['build.release', 'express', 'watch:release']);		
	grunt.registerTask('server.debug', ['build.debug', 'express', 'watch:debug']);		
};
