var path = require('path');

module.exports = function(grunt) { 
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
				
		clean: {
			build: ["build"]
		},


		copy: {
			paella: {
				files: [
					// Basic Paella
					{expand: true, dot:true, cwd: 'node_modules/PaellaPlayer', src: ['**'], dest: 'build/paella'},
					// Paella Opencast
					{expand: true, cwd: 'paella-matterhorn/plugins', src: ['**'], dest: 'build/paella/plugins'},
				]
			},
			"paella-opencast": {
				files: [
					// Basic Paella
					{expand: true, cwd: 'build/paella/build/player', src: ['**', '!paella-standalone.js'], dest: 'build/paella-opencast'},
					{expand: true, cwd: 'paella-matterhorn/ui', src: ['**'], dest: 'build/paella-opencast'}
				]
			}
		},
	
		subgrunt: {
			"build.debug": {
				projects: {
					'build/paella': 'build.debug'
				}
			},
			checksyntax: {
				projects: {
					'build/paella': 'checksyntax'
				}				
			}
		},		
		
		jshint: {
			options: {
				jshintrc: 'node_modules/PaellaPlayer/.jshintrc'
			},
			dist: [
				'paella-matterhorn/javascript/*.js',
				'paella-matterhorn/plugins/*/*.js'
			]
		},
		
		
		
				
		watch: {
			 debug: {
				 files: [
				 	'paella-matterhorn/ui/**',
				 	'paella-matterhorn/javascript/*.js',
				 	'paella-matterhorn/plugins/**'
				 ],
				 tasks: ['build']
			}
		},		
		express: {
			dist: {
		      options: {
			      port:3000,
			      server: path.resolve('./server')
		      }
		  }
		}
	});

	grunt.loadNpmTasks('grunt-subgrunt');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	
	grunt.registerTask('default', ['build']);	

	grunt.registerTask('prepare', ['copy:paella']);

	grunt.registerTask('checksyntax', ['prepare', 'jshint', 'subgrunt:checksyntax']);
	grunt.registerTask('build', ['prepare', 'subgrunt:build.debug', 'copy:paella-opencast']);

	
	grunt.registerTask('server', ['build', 'express', 'watch']);		

};
