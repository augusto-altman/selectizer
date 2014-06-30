Selectizer build tool
=============

Based on the [Modernizr](https://github.com/Modernizr/Modernizr) build process, Selectizer is a build tool made for [Node.js](http://nodejs.org/) that compile javascript projects. It allows the developer to divide an entire project into small javascript files (modules) and then select what pieces of code to include in a specific "build", resolving the dependencies automatically (using the [Requirejs's optimization tool](http://requirejs.org/docs/optimization.html)). The final effect is to get all the selected files (and its dependencies) concatenated into one big deliverable javascript.

This tool gives adds to the development process two great advantages:

1. The first one is that you can divide your entire project in small chunks of code located in separated files. So, in a way, Selectizer allows you to modularize you code. Ok, that's nice, but.. what about the dependecies? I mean, if you want to put all together some pieces of code into one big deliverable js, there must be a way to specify _the order_ in which these files are arranged, in other words to resolve the dependecies beteween that pieces of code. For this, each module must specify its dependecies, so that Selectizer can resolve them using r.js (the [Requirejs's optimization tool](http://requirejs.org/docs/optimization.html)). The syntax for specifiying the dependecies is the same as the requirejs.

2. The second one is that you can make custom builds, selecting the modules you want to include. Selectizer will create a final deliverable javascript file with only the specified modules and its dependecies. To specify the modules is needed a configuration file which sytax is detailed below.

How to install it?
-------------

It is avaible in [npm](https://www.npmjs.org/package/selectizer)

```$
npm install selectizer
```

How to use it?
-------------

First of all, Selectizer works always with objects. This means that when you build something, you are building an object. This is because Selectizer wraps the selected modules and its dependecies into an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) and exposes the object through a _window.OBJECT = OBJECT_ assignment.

One important thing to mention is that, at this moment, there is one **big constrain** that will be solved in future revisions. When you build an object, you are only able to specify _internal dependecies_. So, for example if you want to build two objects, _A_ and _B_, and some modules of _A_ depends on some modules of _B_ these are considered _external dependencies_ and then there is no way to manage this kind of situations. You must load the entire _B_ object before _A_ as usually (of course that both of these objects could be builded separately using selectizer, buy you have to resolve the _external dependencies_ manually). This happens because Selectizer can build only one object at a time.

That having said, you can use the Selectizer build tool from the comand line as well as a node module (using _require_). In both cases it recieves two arguments (specified in order):

*   **The name of the object you want to build (from now on _object folder_)**: Selectizer will always look for a folder named just as the object you want to build. Inside this folder must be a _config_ sub-folder from where Selectizer can obtain the configuration files, and a _src_ sub-folder with all the javascript files (modules) that composes the object.

*   **Tha path of a folder containing all the object folders**: This path must be always relative to the root path of your project. Selectizer will look for any object folder inside this path.

After you generate your build it will be located in the _build_ sub-folder of the object folder.

Configurate
-------------

The configuration files are a **key** part of the Selectizer build process. This is because through these configurations you can select the modules you want to include in a custom build. Also you can specify some fixed code to include always at the bottom of the build.

So, there are two configuration files that must be always inside a sub-folder of your object folder, named _config_. These are:

*   **OBJECT.initCode.js**: Here you can specify some fixed code that will be always at the bottom of your IIFE's object definition.

*   **OBJECT.config.json**: Here you can select the modules you want to include for a specific custom build. The json itself is an object with two properties:
    *   _dependencies_: An array of the modules you want to include in a specific build.
    *   _paths_ (optional): An optional object where you can specify the path of some modules (relative to the _src_ folder). These feature was added to create aliases for the module's paths. Because to define a module you must use the [Requirejs](http://requirejs.org/docs/api.html#define) syntax, in each module you can specify their dependencies using its paths, but these is a problem if you decide to change the path of some module, because you will have to go into every dependant module and change it as well. With these system for _aliasing_ these problem is solved. But again, its use is only optional.

Example
-------------

As you can see the directory arrangment is very important in order to build effective projects. So lets define our properly set folder arrangment.

-   root
    -   objs
        -   A
            -   config
                -   A.initCode.js
                -   A.config.json
            -   src
                -   utils
                    -   ajaxPost.js
                    -   ajaxGet.js
                -   restCommunication
                    -   callXApi.js
                    -   callYApi.js
                -   vars
                    -   a_.js
        -   B
            -   config
                -   B.initCode.js
                -   B.config.json
            -   src
                -   helpers
                    -   parser.js
                -   interpreter
                    -   getCode.js
                    -   execute.js
                -   variables
                    -   internalB.js

I have created and commited these entire sample directory inside the _example_ folder of this repo, so download it, check it out, and follow the instructions below. You can play with it.

So, for example, if you want to build the _A_ object using the command line, you should execute:

```$
selectizer A objs. 
```

Remember that, in node, to execute a command downloaded with _npm_, you must to execute it from _node\_modules/.bin_. Also remember that with selectizer the second argument is a path that is always relative to your project's root directory.

If you want to use it as a node module then you should do this:

```JavaScript
var gen = require('selectizer');
gen('A', 'objs');
```

After execute this stuff you will find the build in _objs/A/build/A.js_

Contact me
-------------

**e-mail**: augusto.altman@gmail.com