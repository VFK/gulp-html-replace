'use strict';

var Parser = require('./parser');
var through = require('through2');
var common = require('./common');

module.exports = function (options, userConfig) {
    var tasks = common.parseTasks(options);

    var config = {
        keepUnassigned: false,
        keepBlockTags: false,
        resolvePaths: false
    };

    if (typeof userConfig === 'boolean') {
        config.keepUnassigned = userConfig;
    } else if (typeof userConfig === 'object') {
        config = common.extend(config, userConfig);
    }

    return through.obj(function (file, enc, callback) {
        var parser = new Parser(tasks, config, file);

        if (file.isBuffer()) {
            parser.write(file.contents);
            parser.end();

            var contents = new Buffer(0);
            parser.on('data', function (data) {
                contents = Buffer.concat([contents, data]);
            });
            parser.once('end', function () {
                file.contents = contents;

                this.push(file);
                return callback();
            }.bind(this));
        } else {
            if (file.isStream()) {
                file.contents = file.contents.pipe(parser);
            }

            this.push(file);
            return callback();
        }
    });
};


