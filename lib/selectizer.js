module.exports = function(obj, objf) {
  var fs = require('fs'),
      objectsFolder = setObjectsFolder(objf),
      object = setObject(obj, objectsFolder);

  if(!!objectsFolder && !!object) {
    var mkdirp = require('mkdirp'),
      requirejs = require('requirejs'),
      buildFolder = objectsFolder + '/' + object + '/build/',
      config = setConfig(),
      initCode = generate(),
      options = setOptions();

    mkdirp(buildFolder, function (err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });

    fs.writeFileSync(buildFolder + object + '-init.js', initCode);

    requirejs.optimize(options, function (buildResponse) {
      var mod = fs.readFileSync(options.out, 'utf8');

      mod = mod.replace('define("../build/' + object + '-init", function(){});', '');
      mod = mod.replace('define("' + object + '", function(){});', '');
      mod = mod.replace(/\s*?\n;\s*?\n/g, '\n');

      fs.writeFileSync(options.out, mod, 'utf8');

      fs.unlinkSync(buildFolder + object + '-init.js');
    }, function(err) {
        console.log(err);
    });
  }

  function setObject(obj, objf) {
    if(!objf)
      return false;
    else if (!obj) {
      console.error('Error: Generation requires an object name.');
      return false;
    } 
    else if(!fs.existsSync( objf + '/' + obj)) {
      console.error('Error: Generation requires a folder named ' + obj + ' in the path ' + objf);
      return false;
    }
    else if(!fs.existsSync(objf + '/' + obj + '/' + 'src')) {
      console.error('Error: Generation requires a folder named src in the path ' + objf + '/' + obj);
      return false;
    }
    else if(!fs.existsSync(objf + '/' + obj + '/' + 'config')) {
      console.error('Error: Generation requires a folder named config in the path ' + objf + '/' + obj);
      return false;
    }

    return obj;
  }

  function setObjectsFolder(objf) {
    var path = __dirname;
    path = path.split("node_modules");
    path = path[0];
    var toRet = objf || "";
    toRet = path + toRet

    if (!fs.existsSync(toRet)) {
      console.error('Error: There is no objects folder in the path ' + toRet);
      toRet = false;
    } 

    return toRet;
  }

  function setConfig() {
    var config = false;

    if(!!object && !!objectsFolder){
      config = require(objectsFolder + '/' + object + '/config/' + object + '.config.json');

      // Set some defaults
      config = config || {};
      config.name = config.name || '';
      config.dependencies = config.dependencies || [];
    }

    return config;
  }

  function generate() {
    if(!!config && !!objectsFolder && !!object){
      var output = 'require([';
      var count = 0;
      // Load in the rest of the options (they dont return values, so they aren't declared
      for(dep in config.dependencies){
          if(count === 0)
              output += '"' + config.dependencies[dep] + '"';
          else
          output += ', "' + config.dependencies[dep] + '"';
          count++;
      };

      output += '], function() {\n';

      var initCodeFile = fs.readFileSync(objectsFolder + '/' + object + '/config/' + object + '.initCode.js', 'utf8');

      output += initCodeFile +
      '\n' +
      '});';

      return output;
    }
    else
      return false;
  }

function setOptions() {
    if(!!objectsFolder && !!config && !!object) {
      return {
        baseUrl: objectsFolder + '/' + object + '/src',
        name: "../build/" + object + "-init",
        out: buildFolder + object + ".js" ,
        optimize: "none",
        useStrict: true,
        paths: config.paths,
        wrap: {
          start: ';(function(window, document, undefined){',
          end: '})(this, document);'
        },
        onBuildWrite: function (id, path, contents) {
          if ((/define\(.*?\{/).test(contents)) {
            //Remove AMD ceremony for use without require.js or almond.js
            contents = contents.replace(/define\(.*?\{/, '');

            contents = contents.replace(/\}\)\s*?;\s*?$/,'');

            contents = contents.replace("return;",'');
          }
          else if ((/require\([^\{]*?\{/).test(contents)) {
            contents = contents.replace(/require[^\{]+\{/, '');
            contents = contents.replace(/\}\);\s*$/,'');
          }
          return contents;
        }
      };
    }
    else
      return false;
  }
};