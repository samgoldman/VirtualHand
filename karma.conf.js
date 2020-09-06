module.exports = function(config) {
    config.set({
    basePath: '.',
    frameworks: ['jasmine', 'requirejs'],
    files: [{
          pattern: 'app/views/**/*.js',
          included: false
        }, {
          pattern: 'test_frontend/**/*.js',
          included: false
        },
        "test-main.js"],
  
    preprocessors: {
      'app/views/**/*.js': ['coverage']
    },
  
    reporters: ['progress', 'coverage'],
  
    coverageReporter: {
      // specify a common output directory
      dir: 'coverage',
      reporters: [
        { type: 'lcov', subdir: 'report-lcov' },
        { type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' }
      ]
    },
  
    browsers: ['ChromeHeadless', 'Chrome', 'Firefox']
    });
};