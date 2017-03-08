const path = require('path');
const package = require('./package.json');
const config = 'Release';
const libName = package.name;
const includePath = __dirname;

const isNodeApiBuiltin = process.versions.modules >= 52;
let libPath;
if (!isNodeApiBuiltin) {
   libPath = path.join(__dirname, 'build', config, libName + '.lib');
} else {
   libPath = 'node.lib';
}

module.exports = {
   version: package.version,
   include: includePath,
   lib: libPath,
   name: libName,
   isNodeApiBuiltin: isNodeApiBuiltin,
};
