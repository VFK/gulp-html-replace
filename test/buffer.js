'use strict';

var plugin = require('..');
var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var assert = require('assert');

function compare(fixture, expected, stream, done) {
    stream
    .once('data', function (file) {
        assert(file.isBuffer());
        assert.strictEqual(String(file.contents), expected);
        done();
    })
    .end(new File({
        base: path.resolve('www'),
        path: path.resolve('www', 'pages', 'index.html'),
        contents: fixture
    }));
}

describe('Buffer mode', function () {
    it('should replace blocks', function (done) {
        var fixture = fs.readFileSync(path.join('test', 'fixture.html'));
        var expected = fs.readFileSync(path.join('test', 'expected.html'), 'utf8');

        var stream = plugin({
            css: 'css/combined.css',
            js_files: ['js/one.js', 'js/two.js?ts=123', 'js/three.js?v=v1.5.3-1-g91cd575'],
            js_files_tpl: {
                src: 'js/with_tpl.js',
                tpl: '<script src="%s"></script>'
            },
            js_files_tpl_multiple: {
                src: ['js/with_tpl.js', 'js/with_tpl_2.js'],
                tpl: '<script src="%s"></script>'
            },
            js_files_tpl_2vars: {
                src: [['js/with_tpl_2vars1.js', 'js/with_tpl_2vars2.js']],
                tpl: '<script data-main="%s" src="%s"></script>'
            },
            js_files_tpl_2vars_multiple: {
                src: [['js/with_tpl_2vars1.js', 'js/with_tpl_2vars2.js'], ['js/with_tpl_2vars1_2.js', 'js/with_tpl_2vars2_2.js']],
                tpl: '<script data-main="%s" src="%s"></script>'
            },
            js_files_x_tpl: {
                src: null,
                tpl: '<script src="js/%f.min.js"></script>'
            },
            js_files_x_tpl_src: {
                src: 'js',
                tpl: '<script src="%s/%f.min.js"></script>'
            },
            js_files_x_tpl_multiple: {
                src: ['js/with_tpl.js', 'js/with_tpl_2.js'],
                tpl: '<script data-src="%f.data" src="%s"></script>'
            },
            js_files_x_tpl_2vars: {
                src: [['js/with_tpl_2vars1.js', 'js/with_tpl_2vars2.js']],
                tpl: '<script data-src="%f%e" data-main="%s" src="%s"></script>'
            },
            js_files_x_tpl_2vars_multiple: {
                src: [['js/with_tpl_2vars1.js', 'js/with_tpl_2vars2.js'], ['js/with_tpl_2vars1_2.js', 'js/with_tpl_2vars2_2.js']],
                tpl: '<script data-src="%f.data" data-main="%s" src="%s"></script>'
            },
            'lorem-ipsum': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        });

        compare(fixture, expected, stream, done);
    });

    it('should work with inline html', function (done) {
        var fixture = '<!DOCTYPE html><head><!-- build:css --><link rel="stylesheet" href="_index.prefix.css"><!-- endbuild --></head>';
        var expected = '<!DOCTYPE html><head><link rel="stylesheet" href="css/combined.css"/></head>';

        var stream = plugin({css: 'css/combined.css'});
        compare(new Buffer(fixture), expected, stream, done);
    });

    it('should not fail if there are no build tags at all', function (done) {
        var fixture = '<!DOCTYPE html><head><link rel="stylesheet" href="_index.prefix.css"></head>';

        var stream = plugin({css: 'css/combined.css'});
        compare(new Buffer(fixture), fixture, stream, done);
    });

    describe('Options', function () {

        describe('keepUnassigned', function () {
            it('Should keep empty blocks', function (done) {
                var fixture = '<html>\n<!-- build:js -->\nSome text\n<!-- endbuild -->\n</html>';
                var expected = '<html>\nSome text\n</html>';

                var stream = plugin({}, {keepUnassigned: true});
                compare(new Buffer(fixture), expected, stream, done);
            });

            it('Should remove empty blocks', function (done) {
                var fixture = '<html>\n<!-- build:js -->\nSome text\n<!-- endbuild -->\n</html>';
                var expected = '<html>\n</html>';

                var stream = plugin();
                compare(new Buffer(fixture), expected, stream, done);
            });
        });

        describe('keepBlockTags', function () {
            it('Should keep placeholder tags without arguments', function (done) {
                var fixture = '<html>\n<!-- build:js -->\nSome text\n<!-- endbuild -->\n</html>';
                var expected = '<html>\n<!-- build:js -->\n<!-- endbuild -->\n</html>';

                var stream = plugin({}, {keepBlockTags: true});
                compare(new Buffer(fixture), expected, stream, done);
            });

            it('Should keep placeholder tags with arguments', function (done) {
                var fixture = '<html>\n<!-- build:lorem -->\nSome text\n<!-- endbuild -->\n</html>';
                var expected = '<html>\n<!-- build:lorem -->\nipsum\n<!-- endbuild -->\n</html>';

                var stream = plugin({lorem: 'ipsum'}, {keepBlockTags: true});
                compare(new Buffer(fixture), expected, stream, done);
            });

            it('Should remove placeholder tags without arguments', function (done) {
                var fixture = '<html>\n<!-- build:js -->\nSome text\n<!-- endbuild -->\n</html>';
                var expected = '<html>\n</html>';

                var stream = plugin();
                compare(new Buffer(fixture), expected, stream, done);
            });

            it('Should remove placeholder tags with arguments', function (done) {
                var fixture = '<html>\n<!-- build:lorem -->\nSome text\n<!-- endbuild -->\n</html>';
                var expected = '<html>\nipsum\n</html>';

                var stream = plugin({lorem: 'ipsum'});
                compare(new Buffer(fixture), expected, stream, done);
            });

            it('Should keep indentation', function (done) {
                var fixture = '<html>\n  <!-- build:js -->\n  Some text\n  <!-- endbuild -->\n</html>';
                var expected = '<html>\n  <!-- build:js -->\n  <!-- endbuild -->\n</html>';

                var stream = plugin({}, {keepBlockTags: true});
                compare(new Buffer(fixture), expected, stream, done);
            });
        });

        describe('resolvePaths', function () {
            it('Should resolve relative paths', function (done) {
                var fixture = '<html>\n<!-- build:js -->\n<script src="file.js"></script>\n<!-- endbuild -->\n</html>';
                var expected = '<html>\n<script src="../../lib/script.js"></script>\n</html>';

                var stream = plugin({js: 'lib/script.js'}, {resolvePaths: true});
                compare(new Buffer(fixture), expected, stream, done);
            });
        });
    });

    describe('Legacy versions', function () {
        it('[version <1.2] should keep empty blocks (keepUnassigned = true)', function (done) {
            var fixture = '<html>\n<!-- build:js -->\nThis should be removed if "keepUnassigned" is false\n<!-- endbuild -->\n</html>';
            var expected = '<html>\nThis should be removed if "keepUnassigned" is false\n</html>';

            var stream = plugin({}, true);
            compare(new Buffer(fixture), expected, stream, done);
        });

        it('[version <1.2] should remove empty blocks (keepUnassigned = false)', function (done) {
            var fixture = '<html>\n<!-- build:js -->\nThis should be removed if "keepUnassigned" is false\n<!-- endbuild -->\n</html>';
            var expected = '<html>\n</html>';

            var stream = plugin();
            compare(new Buffer(fixture), expected, stream, done);
        });
    });

});
