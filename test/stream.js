'use strict';

var plugin = require('../lib/index');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var assert = require('assert');
var es = require('event-stream');

function compare(fixture, expected, stream, done) {
    var fakeFile = new gutil.File({
        contents: fixture
    });
    stream.write(fakeFile);

    stream.once('data', function (file) {
        assert(file.isStream());

        file.contents.pipe(es.wait(function (err, data) {
            assert.equal(data.toString(), expected.toString());
            done();
        }));
    });
}

describe('Stream mode', function () {
    it('should replace blocks', function (done) {
        var fixture = fs.createReadStream(path.join('test', 'fixture.html'));
        var expected = fs.readFileSync(path.join('test', 'expected.html'));

        var stream = plugin({
            css: 'css/combined.css',
            js_files: ['js/one.js', 'js/two.js?ts=123'],
            'lorem-ipsum': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            images: {
                src: 'img/avatar.png',
                tpl: '<img src="%s" alt="Avatar"/>'
            }
        });

        compare(fixture, expected, stream, done);
    });

    it('should work with inline html', function (done) {
        var fixture = ['<!DOCTYPE html><head><!-- build:css --><link rel="stylesheet" href="_index.prefix.css"><!-- endbuild --></head>'];
        var expected = '<!DOCTYPE html><head><link rel="stylesheet" href="css/combined.css"></head>';

        var stream = plugin({css: 'css/combined.css'});
        compare(es.readArray(fixture), expected, stream, done);
    });

    describe('Linefeed', function () {

        it('should keep "\\n" linefeed', function (done) {
            var fixture = ['<hello>\n<world>'];
            var expected = '<hello>\n<world>';

            var stream = plugin();
            compare(es.readArray(fixture), expected, stream, done);
        });

        it('should keep "\\r\\n" linefeed', function (done) {
            var fixture = ['<hello>\r\n<world>'];
            var expected = '<hello>\r\n<world>';

            var stream = plugin();
            compare(es.readArray(fixture), expected, stream, done);
        });

        it('should keep "\\r" linefeed', function (done) {
            var fixture = ['<hello>\r<world>'];
            var expected = '<hello>\r<world>';

            var stream = plugin();
            compare(es.readArray(fixture), expected, stream, done);
        });
    });

    describe('Legacy versions', function () {
        it('[version <1.2] should keep empty blocks (keepUnused = true)', function (done) {
            var fixture = ['<html>\n', '<!-- build:js -->\n', 'This should be removed if "keepUnassigned" is false\n', '<!-- endbuild -->\n', '</html>'];
            var expected = '<html>\nThis should be removed if "keepUnassigned" is false\n</html>';

            var stream = plugin({}, true);
            compare(es.readArray(fixture), expected, stream, done);
        });

        it('[version <1.2] should remove empty blocks (keepUnused = false)', function (done) {
            var fixture = ['<html>\n', '<!-- build:js -->\n', 'This should be removed if "keepUnassigned" is false\n', '<!-- endbuild -->\n', '</html>'];
            var expected = '<html>\nThis should be removed if "keepUnassigned" is false\n</html>';

            var stream = plugin();
            compare(es.readArray(fixture), expected, stream, done);
        });
    });

});
