function GenerationHandler(obj, objf, callback) {
	var genhdlr = Object.create(ObjectSources(obj, objf)),
		fs = require('fs'),
		mkdirp = require('mkdirp'),
		requirejs = require('requirejs');

	function generateInit() {
		var output = 'require([',
			count = 0,
			initCodeFile = null;

		for (var inc in genhdlr.data.config.modules) {
			if (count === 0) {
				output += '"' + genhdlr.data.config.modules[inc] + '"';
			} else {
				output += ', "' + genhdlr.data.config.modules[inc] + '"';
			}
			count++;
		}

		output += '], function() {\n';

		initCodeFile = fs.readFileSync(genhdlr.data.paths.config + genhdlr.data.object + '.initCode.js', 'utf8');

		output += initCodeFile + '\n' + '});';

		return fs.writeFileSync(genhdlr.data.paths.build + genhdlr.data.object + '-init.js', output);
	}

	if (!!genhdlr.success) {
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

		genhdlr.generate = function() {
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
					generateInit();
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
		};
	}

	callback(genhdlr);
}