# broccoli-sass

The broccoli-sass plugin compiles `.scss` and `.sass` files with
[libsass](https://github.com/hcatlin/libsass).

## Installation

```bash
npm install --save-dev broccoli-sass
```

## Usage

```js
var compileSass = require('broccoli-sass');

var outputTree = compileSass(inputTrees, inputFile, outputFile, options);
```

* **`inputTrees`**: An array of trees that act as the include paths for
  libsass. If you have a single tree, pass `[tree]`.

* **`inputFile`**: Relative path of the main `.scss` or `.sass` file to compile. This
  file must exist in one of the `inputTrees`.

* **`outputFile`**: Relative path of the output CSS file.

* **`options`**: A hash of options for libsass. Supported options are
  `imagePath`, `outputStyle`, `sourceComments`, and `sourceMap`.

### Example

```js
var appCss = compileSass(sourceTrees, 'myapp/app.scss', 'assets/app.css');
```

## Source Maps

You can enable source maps by setting `sourceMap: true` in the options. It's
likely that your SASS source files aren't in the output tree (and hence are not
available to your dev tools over HTTP), so you'll need to tell your dev tools
where to find the source files:

#### Instructions for Chrome

1. Open DevTools > Sources
1. Reveal the Sources pane on the left hand side (it might be hidden)
1. Right-click and use _Add folder to workspace_ to add your project as a Workspace
1. Locate a SASS source files in the tree
1. Right-click on one of them and use _Map to File System Resource..._ to create the mapping
