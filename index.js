var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var includePathSearcher = require('include-path-searcher')
var Writer = require('broccoli-writer')
var mapSeries = require('promise-map-series')
var sass = require('node-sass')
var _ = require('lodash')
var rsvp = require('rsvp')
var sourceMap = require('source-map');


module.exports = SassCompiler
SassCompiler.prototype = Object.create(Writer.prototype)
SassCompiler.prototype.constructor = SassCompiler
function SassCompiler (sourceTrees, inputFile, outputFile, options) {
  if (!(this instanceof SassCompiler)) return new SassCompiler(sourceTrees, inputFile, outputFile, options)
  if (!Array.isArray(sourceTrees)) throw new Error('Expected array for first argument - did you mean [tree] instead of tree?')
  this.sourceTrees = sourceTrees
  this.inputFile = inputFile
  this.outputFile = outputFile
  options = options || {}
  this.sassOptions = {
    imagePath: options.imagePath,
    outputStyle: options.outputStyle,
    sourceComments: options.sourceComments,
    sourceMap: options.sourceMap
  }
}

SassCompiler.prototype.write = function (readTree, destDir) {
  var self = this

  var destFile = destDir + '/' + this.outputFile
  mkdirp.sync(path.dirname(destFile))
  return mapSeries(this.sourceTrees, readTree)
    .then(function (includePaths) {
      var deferred = rsvp.defer();
      var sassOptions = {
        file: includePathSearcher.findFileSync(self.inputFile, includePaths),
        includePaths: includePaths,
        outFile: destFile,
        success: function() {
          if (self.sassOptions.sourceMap) {
            self.processSourceMap(includePaths, sassOptions);
          }
          deferred.resolve();
        },
        error: function(err) {
          deferred.reject(err);
        }
      }
      _.merge(sassOptions, self.sassOptions)
      sass.renderFile(sassOptions)
      return deferred.promise;
    })
}

SassCompiler.prototype.processSourceMap = function(includePaths, sassOptions) {
  debugger;
  var outputFile = sassOptions.outFile;
  var sourceMapFile = sassOptions.sourceMap === true
      ? outputFile + '.map'
      : path.resolve(outputFile, sassOptions.sourceMap);
  var sourceMap = JSON.parse(fs.readFileSync(sourceMapFile));
  sourceMap.sourcesContent = sourceMap.sourcesContent || [];
  for (var i = 0; i < sourceMap.sources.length; i++) {
    if (!sourceMap.sourcesContent[i]) {
      var sourceFile = sourceMap.sources[i].split('/').slice(1).join('/');
      sourceFile = includePathSearcher.findFileSync(sourceFile, includePaths);
      var sourceContent = fs.readFileSync(sourceFile);
      sourceMap.sourcesContent[i] = sourceContent;
    }
  }
  console.log(sourceMap);
};
