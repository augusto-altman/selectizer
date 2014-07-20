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