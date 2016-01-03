'use strict';

var stream = require('stream');
var reduce = require('stream-reduce');
var buffer = require('vinyl-buffer');

function fetchSrcString(src) {

    return new Promise(function (resolve, reject) {
        if (typeof src.pipe === 'function' && typeof src.on === 'function') {
            src
                .pipe(buffer())
                .pipe(reduce(function (accumulation, file) {
                    return file.contents.toString();
                }, ''))
                .on('data', function (srcString) {
                    resolve(srcString);
                })
                .on('error', function (error) {
                    reject(error);
                });
        } else {
            resolve(src);
        }
    });
}

module.exports = {
    /**
     * tasks = {
     *     'task-name': {
     *         'src': [file1, file2],
     *         'tpl': '<script src="%s"></script>'
     *     },
     *     ....
     * }
     **/
    parseTasks: function (options) {
        options = options || {};

        var utilExtensions = /%f|%e/g;
        var tasksByNames = {};

        var tasksPromises = Object.keys(options).map(function (name) {

            var task = {
                src: [],
                tpl: '',
                uni: {},
                srcIsNull: false
            };

            return Promise
                .resolve()
                .then(function () {
                    var item = options[name];

                    if (typeof item.src !== 'undefined') {
                        return fetchSrcString(item.src)
                            .then(function (itemSrcString) {
                                task.srcIsNull = itemSrcString === null;
                                task.src = task.src.concat(itemSrcString);
                                task.tpl = item.tpl;
                            });
                    } else {
                        task.src = task.src.concat(item);
                    }
                })
                .then(function () {
                    var result;

                    while (result = utilExtensions.exec(task.tpl)) {
                        var type = result[0];
                        var unique = {};

                        if (task.uni[type]) {
                            continue;
                        }

                        unique.regex = new RegExp(result[0], "g");
                        unique.value = null;
                        task.uni[type] = unique;
                    }
                })
                .then(function () {
                    tasksByNames[name] = task;
                });
        });

        return Promise.all(tasksPromises)
            .then(function() {
               return tasksByNames;
        });
    },

    regexMatchAll: function (string, regexp) {
        var matches = [];
        string.replace(regexp, function () {
            var arr = Array.prototype.slice.call(arguments);
            matches.push(arr);
        });
        return matches;
    }
};
