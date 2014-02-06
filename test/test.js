'use strict';

var htmlreplace = require('../lib/index');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var should = require('should');

function getFile(file_path) {
    return new gutil.File({
        path: file_path,
        base: path.dirname(file_path),
        contents: fs.readFileSync(file_path)
    });
}

function getFixture(name) {
    return getFile(path.join('test', 'fixtures', name));
}

function getExpected(name) {
    return getFile(path.join('test', 'expected', name));
}

function compare(name, stream, done) {
    stream.on('data', function (new_file) {
        if (path.basename(new_file.path) === name) {
            should(getExpected(name).contents.toString()).eql(new_file.contents.toString());
        }
    });

    stream.on('end', function () {
        done();
    });

    stream.write(getFixture(name));
    stream.end();
}

describe('gulp-html-replace', function () {
    it('should pass file through', function (done) {
        var a = 0;

        var fake_file = new gutil.File({
            path: './test/fixtures/file.js',
            cwd: './test/',
            base: './test/fixtures/',
            contents: new Buffer('wadup();')
        });

        var stream = htmlreplace();

        stream.on('data', function (newFile) {
            should.exist(newFile);
            should.exist(newFile.path);
            should.exist(newFile.relative);
            should.exist(newFile.contents);
            newFile.path.should.equal('./test/fixtures/file.js');
            newFile.relative.should.equal('file.js');
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(1);
            done();
        });

        stream.write(fake_file);
        stream.end();
    });

    it('should work with single task name and single file', function (done) {
        var stream = htmlreplace('css', '/css/combined.css');
        compare('01.html', stream, done);
    });

    it('should work with single task name and multiple files', function (done) {
        var stream = htmlreplace('js', ['hero.js', 'monster.js']);
        compare('02.html', stream, done);
    });

    it('should work with multiple task names, multiple AND single files', function (done) {
        var stream = htmlreplace({
            'css': ['css/normalize.css', 'css/main.css'],
            'js': 'js/bundle.js'
        });
        compare('03.html', stream, done);
    });

    it('should remove blocks with orphaned names', function (done) {
        var stream = htmlreplace('css', 'css/main.css');
        compare('04.html', stream, done);
    });

    it('should keep the indentation', function (done) {
        var stream = htmlreplace({
            'css': 'style.css',
            'js': 'main.js'
        });
        compare('05.html', stream, done);
    });
    
    it('should accept hyphen', function (done) {
        var stream = htmlreplace({
            'css-hyphen': 'style.css',
            'js-with-three-hyphens': 'main.js'
        });
        compare('06.html', stream, done);
    });

    it('should work with custom templates with multiple tasks', function (done) {
        var stream = htmlreplace({
            'css-template': {
                'files': 'style.min.css',
                'tpl': '<link href="%s" rel="stylesheet">'
            },
            'js-template': {
                'files': 'bundle.min.js',
                'tpl': '<script src="%s" async="true"/>'
            }
        });
        compare('07.html', stream, done);
    });

    it('should work with custom templates with single task', function (done) {
        var stream = htmlreplace('js', 'scripts.all.js', '<script src="%s" data-custom-attribute="yep"/>');
        compare('08.html', stream, done);
    });

    it('should replace text', function (done) {
        var text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vehicula, arcu rutrum faucibus ' +
            'tempus, libero sem\ninterdum neque, quis scelerisque lacus libero vitae ligula. Quisque diam lacus, ' +
            'placerat ut volutpat id, tristique a\nvelit. Pellentesque rhoncus quam a condimentum mollis.';

        var stream = htmlreplace('text', text, '%s');
        compare('09.html', stream, done);
    });
});