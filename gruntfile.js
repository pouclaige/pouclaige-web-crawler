module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        // grunt-contrib-clean
        clean: {
            instrument: "<%= instrument.options.basePath %>"
        },

        // grunt-contrib-jshint
        jshint: {
            files: [
                "<%= instrument.files %>",
                "<%= mochaTest.test.src %>",
                "bin/**.js",
                "gruntfile.js",
                "node_tests/**/*.js"
            ],
            options: grunt.file.readJSON(".jshintrc")
        },

        // grunt-mocha-test
        mochaTest: {
            test: {
                options: {
                    reporter: "spec"
                },
                src: "node_tests/**/*.test.js"
            }
        },

        // grunt-contrib-watch
        watch: {
            files: ["<%= jshint.files %>"],
            tasks: ["beautify", "test"]
        },

        // grunt-istanbul
        instrument: {
            files: "node_libs/**/*.js",
            options: {
                basePath: "coverage/instrument/"
            }
        },
        storeCoverage: {
            options: {
                dir: "coverage/reports/<%= pkg.version %>"
            }
        },
        makeReport: {
            src: "<%= storeCoverage.options.dir %>/*.json",
            options: {
                type: "lcov",
                dir: "<%= storeCoverage.options.dir %>",
                print: "detail"
            }
        },

        // grunt-jsbeautifier
        jsbeautifier: {
            files: ["<%= jshint.files %>"],
            options: {
                js: grunt.file.readJSON(".jsbeautifyrc")
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-istanbul");
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks("grunt-mocha-test");

    grunt.registerTask("register_globals", function (task) {
        var moduleRoot;

        if ("coverage" === task) {
            moduleRoot = __dirname + "/" + grunt.template.process("<%= instrument.options.basePath %>");
        } else if ("test" === task) {
            moduleRoot = __dirname;
        }

        global.MODULE_ROOT = moduleRoot;
        global.MODULE_ROOT_TESTS = __dirname + "/node_tests";
    });

    grunt.registerTask("beautify", ["jsbeautifier"]);
    grunt.registerTask("cover", ["register_globals:coverage", "clean:instrument", "instrument", "lint", "mochaTest", "storeCoverage", "makeReport"]);
    grunt.registerTask("lint", ["jshint"]);
    grunt.registerTask("test", ["register_globals:test", "clean:instrument", "lint", "mochaTest"]);

    grunt.registerTask("default", ["jsbeautifier", "test"]);
};
