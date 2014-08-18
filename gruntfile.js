module.exports = function(grunt) {
	grunt.initConfig({
		//Read the package.json (optional)
		pkg: grunt.file.readJSON('package.json'),

		// Task configuration.
		jshint: {
			options: {
				//strict: true,
				noempty: true,
				curly: true,
				eqeqeq: true,
				eqnull: true,
				undef: true,
				bitwise: true,
				freeze: true,
				latedef: true,
				unused: true,
				trailing: true,
				node: true,
			},
			uses_defaults: ['dist/lib/selectizer.js']
		},
		uglify: {
			options: {
				compress: {
					drop_console: true
				}
			},
			deliver: {
				files: {
					'dist/lib/selectizer.min.js': 'dist/lib/selectizer.js'
				}
			}
		},
		copy: {
			deliver: {
				files: [{
					src: 'src/selectizer',
					dest: 'dist/bin/selectizer'
				}]
			}
		},
		concat: {
			deliver: {
				src: ['src/ObjectSources.js', 'src/GenerationHandler.js', 'src/selectizerModule.js'],
				dest: 'dist/lib/selectizer.js',
			}
		},
		nodeunit: {
			deliver: ['test/**/*.test.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.registerTask('deliver', ['concat:deliver', 'jshint', 'uglify:deliver', 'copy:deliver', 'nodeunit:deliver']);

};