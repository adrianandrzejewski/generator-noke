'use strict';

var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var _s = require('underscore.string');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay(
        chalk.red('Welcome!') + '\n' +
        chalk.yellow('You\'re using the Noke - generator for an sass application with gulp support!')
        ));
    }

    var prompts = [{
      name: 'nodeSass',
      type: 'list',
      message: 'Which CSS preprocessor do you want?',
      default: true,
      choices: [{
        name: 'Node sass, use me, I\'m so fast!',
        value: true
      }, {
        name: 'Ruby Sass, maybe I\'m slow but at least I don\'t need C++ to work..',
        value: false
      }]
    },
    {
      name: "sprite",
      type: 'list',
      default: true,
      message: 'Would you need automatic sprite generation?',
      choices: [{
        name: 'gulp.spritesmith please!',
        value: true
      }, {
        name: 'Nope, I\'ll do sprites on my own',
        value: false
      }]
    }];

    this.prompt(prompts, function (answers) {
      this.includeNodeSass = answers.nodeSass;
      this.includeSprite = answers.sprite;

      done();
    }.bind(this));
  },

  writing: {
    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          includeNodeSass: this.includeNodeSass,
          includeSprite: this.includeSprite
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          includeNodeSass: this.includeNodeSass,
          includeSprite: this.includeSprite
        }
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {
          "kiki": "latest"
        }
      };

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    styles: function () {
      mkdirp('css');
      this.fs.copy(
        this.templatePath('scss'),
        this.destinationPath('scss')
      );
    },

    images: function () {
      mkdirp('images');
    },

    sprite: function () {
      if (this.includeSprite) {
        mkdirp('images/sprite');
      }
      this.fs.copyTpl(
        this.templatePath('scss/main.scss'),
        this.destinationPath('scss/main.scss'),
        {
          includeSprite: this.includeSprite
        }
      );
    }
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      ignorePath: /^(\.\.\/)+/,
      src: 'scss/main.scss'
    });
  }

});