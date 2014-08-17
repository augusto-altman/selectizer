function ObjectSources(obj, objf) {
	var path = require('path'),
		fs = require('fs'),
		config = null,
		objsrc = {};

	objsrc.success = false;
	objsrc.data = {};

	objf = objf || ".";
	objf = path.resolve(process.cwd(), objf);

	if (!obj) {
		objsrc.data.errorMsg = 'Error: Generation requires an object name.';
		objsrc.data.errorCode = 1;
	} else if (!fs.existsSync(objf + '/' + obj)) {
		console.error();
		objsrc.data.errorMsg = 'Error: The path ' + objf + '/' + obj + ' doesn\'t exist';
		objsrc.data.errorCode = 2;
	} else if (!fs.existsSync(objf + '/' + obj + '/' + 'src')) {
		objsrc.data.errorMsg = 'Error: The path ' + objf + '/' + obj + '/src doesn\'t exist';
		objsrc.data.errorCode = 3;
	} else if (!fs.existsSync(objf + '/' + obj + '/' + 'config')) {
		objsrc.data.errorMsg = 'Error: The path ' + objf + '/' + obj + '/config doesn\'t exist';
		objsrc.data.errorCode = 4;
	} else {
		objsrc.success = true;
		objsrc.data.object = obj;
		objsrc.data.objectFolder = objf;
		objsrc.data.config = config;
		objsrc.data.paths = {};
		objsrc.data.paths.build = objf + '/' + obj + '/build/';
		objsrc.data.paths.src = objf + '/' + obj + '/src/';
		objsrc.data.paths.config = objf + '/' + obj + '/config/';

		config = require(objsrc.data.paths.config + objsrc.data.object + '.config.json');

		// Set some defaults
		objsrc.data.config = config || {};
		objsrc.data.config.name = config.name || '';
		objsrc.data.config.modules = config.modules || [];
		objsrc.data.config.paths = config.paths || [];
		objsrc.data.config.wrap = config.wrap || {};
	}

	return objsrc;
}
var GenerationHandler = (function() {
	var fs = require('fs'),
		mkdirp = require('mkdirp'),
		requirejs = require('requirejs');

	function generateInit() {
		var output = 'require([',
			count = 0,
			initCodeFile = null;

		for (var inc in this.data.config.modules) {
			if (count === 0) {
				output += '"' + this.data.config.modules[inc] + '"';
			} else {
				output += ', "' + this.data.config.modules[inc] + '"';
			}
			count++;
		}

		output += '], function() {\n';

		initCodeFile = fs.readFileSync(this.data.paths.config + this.data.object + '.initCode.js', 'utf8');

		output += initCodeFile + '\n' + '});';

		return fs.writeFileSync(this.data.paths.build + this.data.object + '-init.js', output);
	}

	function generateBuild(callback) {
		mkdirp(this.data.paths.build, (function(err) {
			if (!!err) {
				callback({
					success: false,
					data: {
						errorMsg: err,
						errorCode: 0
					}
				});
			} else {
				generateInit.call(this);
				requirejs.optimize(this.data.requireJSOptions, (function() {

					var mod = fs.readFileSync(this.data.requireJSOptions.out, 'utf8');

					mod = mod.replace('define("../build/' + this.data.object + '-init", function(){});', '');
					mod = mod.replace('define("' + this.data.object + '", function(){});', '');
					mod = mod.replace(/\s*?\n\s*?;\n/g, '\n');

					fs.writeFileSync(this.data.requireJSOptions.out, mod, 'utf8');

					fs.unlinkSync(this.data.paths.build + this.data.object + '-init.js');
				}).bind(this), function(err) {
					fs.unlinkSync(this.data.paths.build + this.data.object + '-init.js');
					callback({
						success: false,
						data: {
							errorMsg: err,
							errorCode: 0
						}
					});
				});
			}
		}).bind(this));
	}


	return function(obj, objf) {
		var genhdlr = Object.create(ObjectSources(obj, objf));

		if (!!genhdlr.success) {
			genhdlr.generate = generateBuild;
			genhdlr.data.requireJSOptions = {
				baseUrl: genhdlr.data.paths.src,
				name: "../build/" + genhdlr.data.object + "-init",
				out: genhdlr.data.paths.build + genhdlr.data.object + ".js",
				optimize: "none",
				useStrict: true,
				paths: genhdlr.data.config.paths,
				wrap: genhdlr.data.config.wrap,
				onBuildWrite: function(id, path, contents) {
					if ((/define\(.*?\{/).test(contents)) {
						contents = contents.replace(/define\(.*?\{/, '');

						contents = contents.replace(/\}\);\s*?$/, '');

						contents = contents.replace(/return.*[^return]*$/, '');
					} else if ((/require\([^\{]*?\{/).test(contents)) {
						contents = contents.replace(/require[^\{]+\{/, '');
						contents = contents.replace(/\}\);\s*$/, '');
					}
					return contents;
				}
			};
		}

		return genhdlr;
	};
})();
module.exports = GenerationHandler;