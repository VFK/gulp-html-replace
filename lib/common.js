'use strict';

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
        var utilExtensions = /%f|%e/g;
        var tasks = {};

        Object.keys(options).forEach(function (key) {
            var item = options[key];
            var src = [];
            var tpl = null;
            var uniqueExtensions = {};
            var result;
            var srcIsNull;

            if (typeof item.src !== 'undefined') {
                srcIsNull = item.src === null;
                src = src.concat(item.src);
                tpl = item.tpl;
            } else {
                src = src.concat(item);
            }

            while (result = utilExtensions.exec(tpl)) {
                var type = result[0];
                var unique = {};

                if (uniqueExtensions[type]) {
                    continue;
                }

                unique.regex = new RegExp(result[0], "g");
                unique.value = null;
                uniqueExtensions[type] = unique;
            }

            tasks[key] = {
                src: src,
                tpl: tpl,
                uni: uniqueExtensions,
                srcIsNull: srcIsNull
            };
        });

        return tasks;
    },

    extend: function (source, dest) {
        Object.keys(dest).forEach(function (key) {
            source[key] = dest[key];
        });
        return source;
    },

    // http://cwestblog.com/2013/02/26/javascript-string-prototype-matchall/
    regexMatchAll: function (string, regexp) {
        var matches = [];
        string.replace(regexp, function () {
            var arr = ([]).slice.call(arguments, 0);
            var extras = arr.splice(-2);
            arr.index = extras[0];
            arr.input = extras[1];
            matches.push(arr);
        });
        return matches.length ? matches : null;
    }
};