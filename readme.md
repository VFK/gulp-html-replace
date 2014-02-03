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
<!-- /build -->
```

**name** is the replacement task name.

Syntax looks like this:

```javascript
// single task name replacement
htmlreplace('js', 'scripts/bundle.min.js')

// single task with multiple files
htmlreplace('css', ['normalize.css', 'main.css'])

// multiple tasks with ridiculously long names
htmlreplace({
    'javascripts': 'bundle.js',
    'styles': ['style.css', 'new.css']
})
```

Correct tags will be determined automatically based on file extensions.
Currently supported `js` and `css`.


Blocks with orphaned task names will be removed.

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


