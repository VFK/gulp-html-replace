'use strict';

var util = require('util');

var Block = function (type) {
    this.start = 0;
    this.end = 0;
    this.type = type;
    this.files = [];
    this.linefeed = '\n';
    this.indent = '';
    this.template = null;
};

Block.prototype.getSize = function () {
    return this.end - this.start + 1;
};

Block.prototype.getReplacement = function () {
    var parts = [];
    this.files.forEach(function (file) {
        var compiled = '';
        if (!this.template) {
            var ext = file.split('.').pop().toLowerCase();
            if (ext === 'js') {
                compiled = util.format('%s<script src="%s"></script>', this.indent, file);
            } else if (ext === 'css') {
                compiled = util.format('%s<link rel="stylesheet" href="%s">', this.indent, file);
            }
        } else {
            compiled = this.indent + util.format(this.template, file);
        }
        parts.push(compiled);
    }.bind(this));

    return parts.join(this.linefeed);
};

module.exports = Block;