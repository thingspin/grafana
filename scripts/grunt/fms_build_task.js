
module.exports = function (grunt) {
    "use strict";
    // Concat and Minify the src directory into dist
    grunt.registerTask('fms-dev', [
        'clean:release',
        'clean:build',
        'phantomjs',
        'webpack:fms-dev',
    ]);
    grunt.registerTask('fms-build', [
        'clean:release',
        'clean:build',
        'phantomjs',
        'webpack:fms-prod',
    ]);
};