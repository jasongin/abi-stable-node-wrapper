// TODO: Return correct lib according to the current node runtime.
const path = require('path');
const libPath = 'build/Release/abi-stable-node.node';
module.exports = require('./' + libPath);
