'use strict';
var os = require('os');
var _ = require('underscore');
var _s = require('underscore.string');

module.exports = function (grunt) {

  //////////////////////////////
  // Import Grunt Configuration
  //
  // Combine with System options
  //////////////////////////////
  var deepmerge = require('deepmerge');
  var userConfig = grunt.file.readYAML('config.yml');
  userConfig = deepmerge(userConfig, grunt.file.readJSON('.system.json'));
  userConfig = deepmerge(userConfig, grunt.file.readJSON('.extension.json'));

  grunt.userConfig = userConfig;

  // Slugs and Stuff
  grunt.userConfig.clientSlug = _s.slugify(userConfig.client.name);
  grunt.userConfig.clientCamelCase = _s.camelize(grunt.userConfig.clientSlug);
  grunt.userConfig.clientCamelCase = grunt.userConfig.clientCamelCase.charAt(0).toUpperCase() + grunt.userConfig.clientCamelCase.slice(1);

  // Asset Paths
  var imagesDir = userConfig.assets.imagesDir;
  var cssDir = userConfig.assets.cssDir;
  var sassDir = userConfig.assets.sassDir;
  var jsDir = userConfig.assets.jsDir;
  var fontsDir = userConfig.assets.fontsDir;
  var componentsDir = userConfig.assets.componentsDir;

  // Generator Configuration
  var pagesDir = userConfig.generator.pagesDir;
  var templatesDir = userConfig.generator.templatesDir;
  var partialsDir = userConfig.generator.partialsDir;

  var helpers = userConfig.generator.helpers;
  helpers = require('./' + helpers);

  // Server Configuration
  var port = userConfig.server.port;
  var lrport = port + 1;
  var wnport = port + 2;
  var root = userConfig.server.root;
  var hostname = 'localhost';
  var remoteDebug = false;
  if (userConfig.server.remoteAccess) {
    hostname = '*';
    remoteDebug = true;
  }
  var remoteHost = os.hostname() + '.local';

  // Compass Configuration
  var debugInfo = userConfig.compass.debugInfo;
  var extensions = [];
  _.forEach(userConfig.compass.dependencies, function(v, e) {
    extensions.push(e);
  });

  // Export Configuration
  var distPath = userConfig.export.distPath;
  var exportPath = userConfig.export.path;
  var assetPrefix = userConfig.export.assetPrefix;

  // Github Configuration
  var gh_commit = userConfig.git.defaultCommit;
  var gh_upstream = userConfig.git.deployUpstream;
  var gh_deploy = userConfig.git.deployBranch;
  
  //////////////////////////////
  //Grunt Config
  //////////////////////////////
  grunt.initConfig({
    // Development Server
    connect: {
      server: {
        options: {
          port: port,
          base: root,
          hostname: hostname
        }
      }
    },

    // Watch Task
    watch: {
      options: {
        livereload: lrport
      },
      html: {
        files: [
          pagesDir + '/**/*.html',
          pagesDir + '/**/*.md',
          partialsDir + '/**/*.html',
          templatesDir + '/**/*.html',
          '!' + templatesDir + '/components/**/*.html'
        ],
        tasks: ['generator:dev']
      },
      generatedComponents: {
        files: [
          templatesDir + '/components/**/*.html',
          'config.yml'
        ],
        tasks: ['create-components']
      },
      js: {
        files: [
          jsDir + '/**/*.js',
          '!' + jsDir + '/**/*.min.js'
        ],
        tasks: ['jshint', 'uglify:dev']
      },
      images: {
        files: [imagesDir + '/**/*'],
        tasks: ['copy:dev']
      },
      fonts: {
        files: [fontsDir + '/**/*'],
        tasks: ['copy:dev']
      },
      components: {
        files: [componentsDir + '/**/*'],
        tasks: ['copy:dev']
      },
      sass: {
        files: [sassDir + '/**/*.scss'],
        tasks: ['compass:dev'],
        options: {
          livereload: false
        }
      },
      css: {
        files: [root + '/' + cssDir + '/**/*.css'],
        tasks: ['csslint']
      },
      config: {
        files: [
          'config.yml',
          '.system.yml'
        ],
        tasks: ['generator:dev']
      }
    },

    // Generator Task
    generator: {
      dev: {
        files: [{
          cwd: pagesDir,
          src: ['**/*'],
          dest: root,
          ext: '.html'
        }],
        options: {
          partialsGlob: [partialsDir + '/**/*.html', partialsDir + '/**/*.md'],
          templates: templatesDir,
          handlebarsHelpers: helpers,
          userConfig: userConfig,
          environment: 'dev',
          development: true,
          lrport: lrport,
          wnport: wnport,
          remoteDebug: remoteDebug,
          assets: ''
        }
      },
      dist: {
        files: [{
          cwd: pagesDir,
          src: ['**/*'],
          dest: distPath,
          ext: '.html'
        }],
        options: {
          partialsGlob: [partialsDir + '/**/*.html', partialsDir + '/**/*.md'],
          templates: templatesDir,
          handlebarsHelpers: helpers,
          userConfig: userConfig,
          environment: 'prod',
          development: false,
          assets: '/' + assetPrefix
        }
      }
    },

    // Compass Task
    compass: {
      options: {
        sassDir: sassDir,
        require: extensions,
        relativeAssets: true,
        importPath: componentsDir,
        debugInfo: debugInfo,
        bundleExec: true
      },
      dev: {
        options: {
          imagesDir: root + '/' + imagesDir,
          cssDir: root + '/' + cssDir,
          javascriptsDir: root + '/' + jsDir,
          fontsDir: root + '/' + fontsDir,
          environment: 'development'
        }
      },
      dist: {
        options: {
          imagesDir: distPath + '/' + imagesDir,
          cssDir: distPath + '/' + cssDir,
          javascriptsDir: distPath + '/' + jsDir,
          fontsDir: distPath + '/' + fontsDir,
          environment: 'production',
          force: true
        }
      }
    },

    // JSHint Task
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        jsDir + '/{,**/}*.js',
        '!' + jsDir + '/{,**/}*.min.js'
      ]
    },

    // CSS Lint
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: [
        root + '/' + cssDir + '/{,**/}*.css'
      ]
    },

    // Image Min Task
    imagemin: {
      dist: {
        options: {
          optimizationLevel: 3
        },
        files: [{
          expand: true,
          cwd: imagesDir,
          src: ['**/*.png', '**/*.jpg'],
          dest: distPath + '/' + imagesDir
        }]
      }
    },

    // SVG Min Task
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: imagesDir,
          src: '**/*.svg',
          dest: distPath + '/' + imagesDir
        }]
      }
    },

    // Uglify Task
    uglify: {
      dev: {
        options: {
          mangle: false,
          compress: false,
          beautify: true
        },
        files: [{
          expand: true,
          cwd: jsDir,
          src: ['**/*.js', '!**/*.min.js'],
          dest: root + '/' + jsDir,
          ext: '.js'
        }]
      },
      dist: {
        options: {
          mangle: true,
          compress: true
        },
        files: [{
          expand: true,
          cwd: jsDir,
          src: ['**/*.js', '!**/*.min.js'],
          dest: distPath + '/' + jsDir,
          ext: '.js'
        }]
      }
    },

    // Copy Task
    copy: {
      dev: {
        files: [
          {
            expand: true,
            cwd: fontsDir,
            src: ['**'],
            dest: root + '/' + fontsDir
          },
          {
            expand: true,
            cwd: imagesDir,
            src: ['**'],
            dest: root + '/' + imagesDir
          },
          {
            expand: true,
            cwd: componentsDir,
            src: ['**'],
            dest: root + '/' + componentsDir
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: fontsDir,
            src: ['**'],
            dest: distPath + '/' + fontsDir
          },
          {
            expand: true,
            cwd: imagesDir,
            src: [
              '**',
              '!**/*.png',
              '!**/*.jpg',
              '!**/*.svg'
            ],
            dest: distPath + '/' + imagesDir
          },
          {
            expand: true,
            cwd: componentsDir,
            src: ['**'],
            dest: distPath + '/' + componentsDir
          }
        ]
      },
      ext: {
        files: [
          {
            expand: true,
            cwd: sassDir,
            src: userConfig.extension.sass,
            dest: '.compass/stylesheets'
          },
          {
            expand: true,
            cwd: imagesDir,
            src: userConfig.extension.images,
            dest: '.compass/templates/project'
          },
          {
            expand: true,
            cwd: jsDir,
            src: userConfig.extension.js,
            dest: '.compass/templates/project'
          },
          {
            expand: true,
            cwd: fontsDir,
            src: userConfig.extension.fonts,
            dest: '.compass/templates/project'
          }
        ]
      }
    },

    // Concat
    concat: {
      rb: {
        options: {
          process: true
        },
        files: {
          '.compass/lib/canary2-style-guide.rb': ['.compass/.template/style-guide.rb']
        }
      },
      gemspec: {
        options: {
          process: true
        },
        files: {
          '.compass/canary2-style-guide.gemspec': ['.compass/.template/style-guide.gemspec']
        }
      }
    },

    // Parallel Task
    parallel: {
      assets: {
        options: {
          grunt: true
        },
        tasks: ['imagemin', 'svgmin', 'uglify:dist', 'copy:dist', 'generator:dist']
      },
      ext: {
        options: {
          grunt: true
        },
        tasks: ['copy:ext', 'concat:rb', 'concat:gemspec']
      },
      remote: {
        options: {
          grunt: true,
          stream: true
        },
        tasks: ['watch', 'exec:weinre']
      },
      remoteLaunch: {
        options: {
          grunt: true,
          stream: true
        },
        tasks: ['watch', 'exec:weinre', 'exec:launch:' + remoteHost, 'exec:launch:' + remoteHost + ':' + wnport + ':client']
      }
    },

    // Exec Task
    exec: {
      launch: {
        cmd: function(host, prt, suffix) {
          prt = prt || port;
          suffix = suffix || '';
          return 'open http://' + host + ':' + prt + '/' + suffix;
        }
      },
      commit: {
        cmd: function(commit) {
          return 'git add ' + distPath + ' && git commit -m "' + commit + '" ' + distPath;
        }
      },
      tagMake: {
        cmd: 'git tag ' + userConfig.client.version
      },
      tagPush: {
        cmd: 'git push --tags ' + userConfig.git.deployUpstream
      },
      deploy: {
        cmd: 'git subtree push --prefix .dist ' + gh_upstream + ' ' + gh_deploy
      },
      export: {
        cmd: function(path) {
          return 'cp -r ' + distPath + ' ' + path;
        }
      },
      ext: {
        cmd: 'cd .compass && bundle exec gem build canary2-style-guide.gemspec && mv canary2-style-guide-' + userConfig.client.version + '.gem ../canary2-style-guide-' + userConfig.client.version + '.gem && cd ..'
      },
      install: {
        cmd: 'gem install canary2-style-guide-' + userConfig.client.version + '.gem && rm canary2-style-guide-' + userConfig.client.version + '.gem'
      },
      weinre: {
        cmd: 'weinre --httpPort ' + wnport + ' --boundHost -all-'
      },
      bundle: {
        cmd: function(path) {
          if (path === '.') {
            return 'bundle install';
          }
          else {
            return 'cd ' + path + '/ && bundle install && cd ..';
          }
        }
      },
    },

    bump: {
      options: {
        files: [
          'package.json',
          'bower.json',
          '.system.json'
        ],
        commit: userConfig.bump.commit,
        commitFiles: userConfig.bump.files,
        createTag: userConfig.bump.tag,
        push: userConfig.bump.push,
        pushTo: userConfig.git.deployUpstream
      }
    }

  });

  grunt.event.on('watch', function(action, filepath) {
    grunt.config([
      'copy:dev',
      'uglify:dev',
      'compass:dev',
      'generator:dev',
      'jshint',
      'csslint'
    ], filepath);
  });

  //////////////////////////////
  // Grunt Task Loads
  //////////////////////////////
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  //////////////////////////////
  // Build Task
  //////////////////////////////
  grunt.registerTask('build', 'Production build', function() {
    var commit = grunt.option('commit');
    var deploy = grunt.option('deploy');

    grunt.task.run(['parallel:assets', 'compass:dist', 'jshint']);

    if (commit) {
      if (commit === true) {
        commit = gh_commit;
      }
      grunt.task.run(['exec:commit:' + commit]);
    }

    
    if (deploy) {
      grunt.task.run(['exec:deploy']);
    }
    
  });

  //////////////////////////////
  // Tag Task
  //////////////////////////////
  grunt.registerTask('tag', 'Tags your release', function() {
    var push = grunt.option('push');

    grunt.task.run('exec:tagMake');

    if (push) {
      grunt.task.run('exec:tagPush');
    }
  });

  
  //////////////////////////////
  // Deploy Task
  //////////////////////////////
  grunt.registerTask('deploy', [
    'exec:deploy'
  ]);

  //////////////////////////////
  // Export Task
  //////////////////////////////
  grunt.registerTask('export', 'Exports your build', function() {
    var path = grunt.option('to') || exportPath;

    grunt.task.run('build', 'exec:export:' + path);
  });

  //////////////////////////////
  // Server Task
  //////////////////////////////
  grunt.registerTask('server-init', [
    'copy:dev',
    'uglify:dev',
    'compass:dev',
    'generator:dev',
    'jshint',
    'csslint'
  ]);

  grunt.registerTask('server', 'Starts a development server', function() {

    var launch = grunt.option('launch');

    grunt.task.run(['bundler']);
    grunt.task.run(['create-components']);


    grunt.task.run(['server-init', 'connect']);

    if (hostname == '*') {
      grunt.task.run(['hostname']);
      if (launch) {
        grunt.task.run(['parallel:remoteLaunch']);
      }
      else {
        grunt.task.run(['parallel:remote']);
      }
    }
    else {
      if (launch) {
        grunt.task.run('exec:launch:localhost');
      }
      grunt.task.run('watch');
    }
  });

  //////////////////////////////
  // Hostname
  //////////////////////////////
  grunt.registerTask('hostname', 'Find Hostname', function() {
    console.log('Server available on local network at http://' + remoteHost + ':' + port);
    console.log('Remote inspector available on local network at http://' + remoteHost + ':' + wnport + '/client');
  });

  //////////////////////////////
  // Update Bundler
  //////////////////////////////
  grunt.registerTask('bundler', 'Manages Development Dependencies', function(path) {
    path = path || '.';
    var gemfileContent = '# Pull gems from RubyGems\nsource "https://rubygems.org"\n';
    _.forEach(grunt.userConfig.compass.dependencies, function(v, e) {
      gemfileContent += 'gem "' + e + '", "' + v + '"\n';
    });
    grunt.file.write(path + '/Gemfile', gemfileContent);

    grunt.task.run(['exec:bundle:' + path]);
  });

  //////////////////////////////
  // Compass Extension
  //////////////////////////////
  grunt.registerTask('extension', 'Build your Compass Extension', function() {
    grunt.task.run(['bundler:.compass']);

    grunt.file.copy('bower.json', '.compass/templates/project/bower.json');
    grunt.file.copy('.editorconfig', '.compass/templates/project/editorconfig.txt');
    grunt.file.copy('.bowerrc', '.compass/templates/project/bowerrc.txt');
    grunt.file.copy('.jshintrc', '.compass/templates/project/jshintrc.txt');
    grunt.file.copy('.csslintrc', '.compass/templates/project/csslintrc.txt');

    // Add Styleguide to Gemfile
    var gemfile = grunt.file.read('Gemfile');
    gemfile += '\ngem "bar-style-guide", "~>' + grunt.userConfig.client.version + '"';
    grunt.file.write('.compass/templates/project/Gemfile.txt', gemfile);

    grunt.task.run(['parallel:ext', 'exec:ext']);

    var install = grunt.option('install');

    if (install) {
      grunt.task.run(['exec:install']);
    }
  });

  //////////////////////////////
  // Create Components from Templates
  //////////////////////////////
  grunt.registerTask('create-components', 'Build real components from component templates', function() {
    // Loop over each item in components
    _.forEach(grunt.userConfig.components, function(v, e) {
      // Grab the template prefix for this component
      var tmpl = e;
      // Load the template from the templates directory
      var template = grunt.file.read('templates/components/' + tmpl + '.html');
      // Create Holder Partial
      var partial = '<div class="prototype-group--' + _s.slugify(tmpl) + '">' +
'\n  <ul component-list>' +
'\n    {{#each options.grunt.userConfig.components.' + tmpl + '}}' +
'\n      <li>' +
'\n        {{{component "' + tmpl + '" this}}}' +
'\n\n        {{#if ../page.examples}}' +
'\n          {{{create-example-html "' + tmpl + '" ../this}}}' +
'\n        {{/if}}' +
'\n      </li>' +
'\n    {{/each}}' +
'\n  </ul>' +
'\n</div>';
      grunt.file.write('partials/components/prototype-group--' + tmpl + '.html', partial);
      // Loop over each version of the component
      _.forEach(v, function(value, name) {
        var singleton = true;
        // If there are no properties to this component, set the name to the value
        if (typeof(name) === 'number') {
          name = value;
        }
        // If the name is an object, pluck off its key
        if (typeof(name) === 'object') {
          singleton = false;
          name = Object.keys(name)[0];
          value = value[name];
        }
        // Replace {{name}} with the name of the component
        var component = template.replace(new RegExp('{{name}}', 'g'), name);
        component = component.replace(new RegExp('{{name.slug}}', 'g'), _s.slugify(name));

        // Replace {{type}} with the type of component
        component = component.replace(new RegExp('{{type}}', 'g'), tmpl);
        component = component.replace(new RegExp('{{type.slug}}', 'g'), _s.slugify(tmpl));

        if (!singleton) {
          // Loop over each property of the component
          _.forEach(value, function(p, k) {
            // If the type of the property is an object, let's convert it
            if (typeof(p) === 'object') {
              p = Array.prototype.slice.call(p);
              // If the key of the property contains class, convert to a space delimited list
              if (k.toLowerCase().indexOf('class') >= 0) {
                p = p.join(' ');
              }
              // If the key of the property doesn't contain class, convert to a comma delimited list
              else {
                p = p.join(', ');
              }
            }
            // Replace each instance of the key in the template with the property
            component = component.replace('{{' + k + '}}', p);
            component = component.replace('{{' + k + '.slug}}', _s.slugify(p));
          });
        }
        // Write component to disk
        grunt.file.write('partials/components/' + tmpl + '/' + tmpl + '--' + _s.slugify(name) + '.html', component);
      });
    });
  });
};