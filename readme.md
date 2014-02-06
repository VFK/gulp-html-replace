# gulp-html-replace

Replace build blocks in HTML with links to combined/compressed scripts or styles.

## Usage

Install `gulp-html-replace` as a development dependency:
```shell
npm install --save-dev gulp-html-replace
```

Blocks in your HTML file should look like this:
```html
<!-- build:<name> -->
...
<!-- endbuild -->
```
**name** is the replacement task name.

Syntax looks like this:
```javascript
// single task name replacement
htmlreplace('js', 'scripts/bundle.min.js')

// single task with multiple files
htmlreplace('css', ['normalize.css', 'main.css'])

// multiple tasks
htmlreplace({
    'javascripts': 'bundle.js',
    'styles': ['style.css', 'new.css']
})
```

Correct tags will be determined automatically based on file extensions.
Currently supported `js` and `css`.
Blocks with orphaned task names will be removed.

If you don't like how the result looks, you can change the template:
```javascript
// single task with custom template
htmlreplace('js', 'min.js', '<link href="%s" media="all" />')

// single task with multiple files and the custom template
htmlreplace('css', ['one.css', 'two.css'], '<script src="%s" async="true"/>')

// multiple tasks with custom templates
htmlreplace({
    'css': {
        'files': 'style.min.css',
        'tpl': '<link href="%s" rel="stylesheet">'
    },
    'js': {
        'files': ['user.js', 'admin.js'],
        'tpl': '<script src="%s" async="true"/>'
    }
})

// you can insert text too
htmlreplace('lorem', 'Lorem ipsum dolor sit amet', '%s')
```

**%s** will be replaced with whatever you provide.
For more info on formatting, please refer to [util.format()](http://nodejs.org/api/util.html#util_util_format_format) documentation.

## Example

index.html:

```html
<!DOCTYPE html>
<html>
    <head>
    .....
    <!-- build:styles -->
    <link rel="stylesheet" href="css/normalize.css">
    <link rel="stylesheet" href="css/main.css">
    <!-- endbuild -->
    .....
    </head>
    <body>
    .....
    <!-- build:js -->
    <script src="js/player.js"></script>
    <script src="js/monster.js"></script>
    <script src="js/world.js"></script>
    <!-- endbuild -->
    .....
```

gulpfile.js:

```javascript
var htmlreplace = require('gulp-html-replace');

gulp.task('default', function() {
  gulp.src('index.html')
    .pipe(htmlreplace({
        'styles': 'styles.min.css',
        'js': 'js/bundle.min.js'
    }))
    .pipe(gulp.dest('build/'));
});
```

Result:

```html
<!DOCTYPE html>
<html>
    <head>
    .....
    <link rel="stylesheet" href="styles.min.css">
    .....
    </head>
    <body>
    .....
    <script src="js/bundle.min.js"></script>
    .....
```