var fs = require('fs');

module.exports = function(grunt) {

  var config = require('./config');

  if(config.cname) {
    fs.writeFile('./dist/CNAME', config.cname);
  }

  grunt.initConfig({
    ngconstant: {
      dist: {
        options: {
          name: 'mp.config',
          dest: 'dist/config.js',
          constants: config
        }
      }
    },
    browserify: {
      all: {
        files: {
          'dist/app.js': 'src/js/index.js'
        }
      }
    },
    uglify: {
      all: {
        options: {
          mangle: true,
          compress: true
        },
        files: {
          'dist/app.js': 'dist/app.js',
        }
      }
    },
    less: {
      all: {
        options: {
          compress: true
        },
        files: {
          'dist/css/app.css': 'src/css/main.less'
        }
      }
    },
    jade: {
      all: {
        options: {
          data: function(dest, src) {
            return {config: config};
          },
          doctype: 'html',
          pretty: false
        },
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.jade', '!views/includes/**/*'],
          dest: 'dist',
          ext: '.html'
        }]
      }
    },
    copy: {
      all: {
        files: [
          {
            cwd: 'src',
            src: ['**', '!js/**', '!**/*.less', '!**/*.jade', '!**/*.js'],
            dest: 'dist',
            expand: true
          }
        ]
      },
      static: {
        files: [
          {
            cwd: 'bower_components',
            src: ['**/*'],
            dest: 'dist/static',
            expand: true
          }
        ]
      }
    },
    watch: {
      options: {
        livereload: true
      },
      css: {
        files: 'src/css/**/*.less',
        tasks: ['less']
      },
      jade: {
        files: 'src/**/*.jade',
        tasks: ['jade']
      },
      scripts: {
        files: 'src/js/**/*.js',
        tasks: ['browserify']
      },
      copy: {
        files: ['src/**', '!src/**/*.less', '!src/**/*.jade', '!src/**/*.js'],
        tasks: ['copy']
      }
    },
    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask(
    'javascript',
    'Compile scripts.',
    ['ngconstant', 'browserify', 'uglify']
  );

  grunt.registerTask(
    'views',
    'Compile views.',
    ['jade', 'less']
  );

  grunt.registerTask(
    'build',
    'Compiles everything.',
    ['copy', 'javascript', 'views']
  );

  grunt.registerTask(
    'deploy',
    'Deploy to GitHub Pages',
    ['build', 'gh-pages']
  )

  grunt.registerTask(
    'default',
    'Build, start server and watch.',
    ['build', 'watch']
  );

}
