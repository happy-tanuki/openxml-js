
var vm = require('vm');
var fs = require('fs');

var SDK = "OpenXmlSdkJs-01-01-02/";

var context = vm.createContext({
  Enumerable: require('linq'),
  JSZip: require('jszip'),
});
['ltxml.js', 'ltxml-extensions.js', 'openxml.js'].forEach(function(path) {
  vm.runInContext(fs.readFileSync(SDK + path, 'utf8'), context, path);
});

var DOMParser = require('xmldom').DOMParser;
context.Ltxml.DOMParser = DOMParser;

module.exports = context;

