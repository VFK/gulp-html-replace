'use strict';

var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var map = require('map-stream');
var Block = require('./block');
var util = require('util');

var PLUGIN_NAME = 'gulp-html-replace';

module.exports = function () {
    var tasks = getTasks(arguments);

    var htmlReplace = function (file, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            return callback(new PluginError(PLUGIN_NAME, 'Streaming is not supported yet.'));
        }

        var build_begin = /<!--\s*build:(\w+(-\w+)*)\s*-->/;
        var build_end = /<!--\s*endbuild\s*-->/;

        var content = file.contents.toString();
        var linefeed = /\r\n/g.test(content) ? '\r\n' : '\n';

        var lines = content.split(linefeed);

        var blocks = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            var block_begin = line.match(build_begin);
            var block_end = build_end.test(line);

            if (block_begin) {
                var name = block_begin[1];
                var task = tasks[name];

                var block = new Block(name);
                block.start = i;
                block.indent = line.match(/^\s*/)[0];
                if (task) {
                    block.files = task.files;
                    block.template = task.tpl;
                    block.linefeed = linefeed;
                }
                blocks.push(block);
            }
            if (block_end) {
                var _block = blocks[ blocks.length - 1 ];
                if (_block) {
                    _block.end = i;
                }
            }
        }

        var offset = 0;
        blocks.forEach(function (block) {
            lines.splice(block.start - offset, block.getSize(), block.getReplacement());
            offset += block.getSize() - 1;
        });

        file.contents = new Buffer(lines.join(linefeed));

        callback(null, file);
    };

    return map(htmlReplace);
};

/**
 * tasks = {
 *     'task-name': {
 *         'files': [file1, file2],
 *         'tpl': '<script src="%s"></script>'
 *     },
 *     ....
 * }
 */
function getTasks(args) {
    var tasks = {};

    if (args.length === 1) {
        for (var key in args[0]) {
            if (args[0].hasOwnProperty(key)) {
                var item = args[0][key];
                var files = [];
                var tpl = null;
                if (typeof item === 'string') {
                    files = [item];
                } else if (util.isArray(item)) {
                    files = item;
                } else {
                    files = util.isArray(item.files) ? item.files : [ item.files ];
                    tpl = item.tpl || null;
                }

                tasks[key] = {
                    'files': files,
                    'tpl': tpl
                };
            }
        }
    } else {
        tasks[ args[0] ] = {
            'files': util.isArray(args[1]) ? args[1] : [ args[1] ],
            'tpl': args[2] || null
        };
    }

    return tasks;
}
