'use strict';

var Block = function (type) {
    this.start = 0;
    this.end = 0;
    this.type = type;
    this.files = [];
    this.linefeed = '\n';
    this.indent = '';
};

Block.prototype.getSize = function () {
    return this.end - this.start + 1;
};

Block.prototype.getReplacement = function () {
    var parts = [];
    this.files.forEach(function (file) {
        var ext = file.split('.').pop().toLowerCase();
        if (ext === 'js') {
            parts.push(this.indent + '<script src="' + file + '"></script>');
        } else if (ext === 'css') {
            parts.push(this.indent + '<link rel="stylesheet" href="' + file + '">');
        }
    }.bind(this));

    return parts.join(this.linefeed);
};

module.exports = Block;