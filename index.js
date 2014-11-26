
var vm = require('vm');
var fs = require('fs');
var path = require('path');

var SDK = "OpenXmlSdkJs-01-01-02";

var context = vm.createContext({
  Enumerable: require('linq'),
  JSZip: require('jszip')
});
['ltxml.js', 'ltxml-extensions.js', 'openxml.js'].forEach(function(name) {
  vm.runInContext(fs.readFileSync(path.join(path.dirname(module.filename), SDK, name), 'utf8'), context, name);
});

var DOMParser = require('xmldom').DOMParser;
context.Ltxml.DOMParser = DOMParser;

module.exports = context;

