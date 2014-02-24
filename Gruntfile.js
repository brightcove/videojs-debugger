'use strict';
var releaseType = process.env.RELEASE_TYPE || 'prerelease';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: ['src/js/*.js'],
    },

    copy: {
      build: {
        files: [{
            src: 'src/css/debugger.css',
            dest: 'dist/debugger.css'
          }, {
            src: 'src/js/bootstrap.js',
            dest: 'dist/bootstrap.js'
          }, {
            src: 'src/js/debugger.js',
            dest: 'dist/debugger.js'
          }
        ]
      },
      version: {
        files: [
          { expand: true, cwd: 'dist', src: ['*'], dest: 'dist/<%= pkg.version %>/' }
        ]
      }
    },

    cssmin: {
      build: {
        files: {
          'dist/debugger.css': ['src/css/debugger.css']
        }
      }
    },

    uglify: {
      build: {
        files: [{
            src: 'src/js/bootstrap.js',
            dest: 'dist/bootstrap.js'
          }, {
            src: 'src/js/debugger.js',
            dest: 'dist/debugger.js'
          }
        ]
      }
    },

    watch: {
      files: ['src/js/*.js'],
      tasks: ['jshint']
    },

    compress: {
      package: {
        options: {
          archive: '<%= pkg.name %>.tgz',
          mode: 'tgz'
        },
        cwd: 'dist',
        expand: true,
        src: ['**']
      }
    },

    release: {
      options: {
        npm: false
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['jshint', 'copy:build', 'uglify', 'cssmin']);
  grunt.registerTask('package', ['default', 'copy:version', 'compress:package']);
  grunt.registerTask('version', 'This should only be called by Team City!', ['release:' + releaseType ]);
};
