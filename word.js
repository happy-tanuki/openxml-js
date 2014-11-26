/*

node word.js <doc_file_path> <cmd_file_path>

doc_file_path: 編集対象のdocxファイル。
cmd_file_path: 編集操作のjsonファイル。以下の形式。

[{
 unit: "p",    // (Option) 操作するときの単位。段落(p)/(r)/テキスト(t) を指定。
 find: "^.*$", // (Option) カーソル位置を指定する正規表現。要素毎にマッチング。
 down: "end",  // (Option) 現在のカーソル位置を down/up/left/right 方向に移動させる。
 replaceWith:  "text", // (Option) カーソル位置の要素を置換する。改行があると要素を区切る。
 insertBefore: "text", // (Option) カーソル位置の直前の要素をコピーして挿入する。
 insertAfter:  "text", // (Option) カーソル位置の直後の要素をコピーして挿入する。
}, ...]

*/

//
// Requires
//
var sys = require('sys');
var fs	= require('fs');
var vm	= require('vm');

var Enumerable = require("./index").Enumerable;
var Ltxml   = require("./index").Ltxml;
var openXml = require("./index").openXml;

//
// Aliases
//
var XAttribute = Ltxml.XAttribute;
var XCData = Ltxml.XCData;
var XComment = Ltxml.XComment;
var XContainer = Ltxml.XContainer;
var XDeclaration = Ltxml.XDeclaration;
var XDocument = Ltxml.XDocument;
var XElement = Ltxml.XElement;
var XName = Ltxml.XName;
var XNamespace = Ltxml.XNamespace;
var XNode = Ltxml.XNode;
var XObject = Ltxml.XObject;
var XProcessingInstruction = Ltxml.XProcessingInstruction;
var XText = Ltxml.XText;
var XEntity = Ltxml.XEntity;
var cast = Ltxml.cast;
var castInt = Ltxml.castInt;

var W = openXml.W;
var NN = openXml.NoNamespace;
var wNs = openXml.wNs;

//
// Arguments
//
//if (process.argv.length < 4) {
//    console.log("node word.js <doc_file_path> <cmd_file_path>");
//    process.exit(1);
//}
var docFilePath = process.argv[2];//, cmdFilePath = process.argv[3];

var doc = new openXml.OpenXmlPackage(fs.readFileSync(docFilePath));
var mainPart = doc.mainDocumentPart();
var mainPartXDoc = mainPart.getXDocument();

// var cmd = JSON.parse(fs.readFileSync(cmdFilePath, 'utf8'));

//
// Main
//
var field = "";
mainPartXDoc.descendants(W.t).forEach(function(t) {
    //var text = p.descendants(W.t).aggregate("", function (text, t) {
    //    return text += t.value;
    //});
    var text = t.value;
    console.log(text);

    var reg = text.match(/^日付[:：][ 　]*([^ 　]*)[ 　]*$/);
    if (reg) {
        field = "日付";
        if (reg[1].length > 0) {
            t.value = "日付： " + (new Date());
            console.log("=>" + t.value);
            field = "";
        }
        return;
    } else if (field == "日付") {
        field = "";
        t.value = (new Date());
        console.log("=>" + t.value);
        return;
    }

    reg = text.match(/^(?:作成者[:：]|氏[ 　]*名)[ 　]*([^ 　]*)[ 　]*$/);
    if (reg) {
        field = "作成者";
        if (reg[1].length > 0) {
            t.value = "作成者： " + "ななし";
            console.log("=>" + t.value);
            field = "";
        }
        return;
    } else if (field == "作成者") {
        field = "";
        t.value = "ななし";
        console.log("=>" + t.value);
        return;
    }

    reg = text.match(/^(?:業務内容[:：])[ 　]*([^ 　]*)[ 　]*$/);
    if (reg) {
        field = "業務内容";
        if (reg[1].length > 0) {
            t.value = "業務内容： " + reg[1] + "\n" + "・abcdef";
            console.log("=>" + t.value);
            field = "";
        }
        return;
    } else if (field == "業務内容") {
        field = "";
        var p = t.ancestors(W.p).first();
        var newP = XElement.parse(p.toString());
        newP.descendants(W.t).first().value = "・abcdef";
        p.addAfterSelf(newP);
        console.log("=>" + t.value);
        return;
    }

    field = "";
    console.log("===");

});

var newP = function(i) {
    var paraText = "Hello Open XML World.  This is paragraph #" + i + ".";
    var p = new XElement(W.p,
			 new XElement(W.r,
				      new XElement(W.t, paraText)));
    return p;
}

var newBodyElement = new XElement(W.body, Enumerable.range(0, 20).select(newP));
mainPartXDoc.root.element(W.body).addAfterSelf(newBodyElement);

fs.writeFileSync("out_"+docFilePath, doc.saveToBuffer());
