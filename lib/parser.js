'use strict';

var util = require('util');
var Transform = require('stream').Transform;
var Block = require('./block');
var common = require('./common');

var regex = /(\n?)([ \t]*)(<!--\s*build:(\w+(?:-\w+)*)\s*-->)\n?([\s\S]*?)\n?(<!--\s*endbuild\s*-->)\n?/ig;

function Parser(tasks, config, file) {
    Transform.call(this);

    this.tasks = tasks;
    this.config = config;
    this.file = file;
}
util.inherits(Parser, Transform);

Parser.prototype._transform = function (chunk, enc, done) {
    var content = chunk.toString('utf8');

    var matches = common.regexMatchAll(content, regex);
    matches.forEach(function(match) {
        var block = new Block(this.config, this.file, match);
        var name = match[4];
        var task = this.tasks[name];
        block.setTask(task);
        content = content.replace(block.replacement, block.compile());
    }.bind(this));

    this.push(content);

    done();
};

module.exports = Parser;
