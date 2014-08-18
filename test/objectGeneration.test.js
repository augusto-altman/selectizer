exports['Object source generation'] = function(test) {
	var fs = require('fs'),
		path = require('path'),
		lib = path.resolve(process.cwd(), 'dist/lib/'),
		genHandler = require(lib + '/selectizer.min.js'),
		handler = genHandler("A", "example/objs/");
	buildPath = path.resolve(process.cwd(), "example/objs/A/build");

	function deleteFolderRecursive(path) {
		if (fs.existsSync(path)) {
			fs.readdirSync(path).forEach(function(file, index) {
				var curPath = path + "/" + file;
				if (fs.statSync(curPath).isDirectory()) { // recurse
					deleteFolderRecursive(curPath);
				} else { // delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	};

	test.expect(7);
	deleteFolderRecursive(buildPath);
	test.ok(!fs.existsSync(buildPath));
	test.ok(handler.success);
	test.strictEqual(typeof handler.generate, 'function');
	handler.generate(function(a) {
		var code;

		test.ok(a.success);
		test.ok(fs.existsSync(buildPath));
		test.ok(fs.existsSync(buildPath + '/A.js'));
		code = fs.readFileSync(buildPath + '/A.js', 'utf8');
		test.strictEqual(code, ';(function(window, document, undefined){\r\n    function ajaxGet(){\r\n        console.log("GET!");\r\n    }\n\r\n' +
			'    function ajaxPost(){\r\n        console.log("POST!");\r\n    }\n\r\n    var a_ = {};\r\n\r\n    \n\r\n    //Independant c' +
			'ode code code\r\n    function callXApi(){\r\n        //Independant code code code\r\n        ajaxGet();\r\n        //Independ' +
			'ant code code code\r\n        ajaxPost();\r\n        //Independant code code code    \r\n    }\r\n    //Independant code code' +
			' code\r\n\r\n    a_.callX = callXApi;\r\n\r\n    \n\n    window.A = a_;\n\n\n\n})(this, document);');
		test.done();
	});
};