module.exports = function(config) {
  config.set({
    basePath: '..',

    files: [{
        pattern: 'src/js/debugger.js',
        included: false
      }, {
        pattern: 'src/css/debugger.css',
        included: false
      },
      'node_modules/video.js/dist/video.js',
      'node_modules/video.js/dist/video-js.css',
      'src/js/bootstrap.js',
      'test/test.js'
    ],

    frameworks: ['qunit'],

    browsers: ['Firefox'],

    singleRun: true
  });
};
