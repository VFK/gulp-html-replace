'use strict';

var plugin = require('..');
var File = require('vinyl');
var assert = require('assert');

describe('null files', function () {
    it('should be passed through', function (done) {
        plugin()
        .once('data', function (file) {
            assert(file.isNull());
            done();
        })
        .end(new File({contents: null}));
    });
});
