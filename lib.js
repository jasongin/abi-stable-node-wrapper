// TODO: Return path to correct lib according to the current node runtime.
const path = require('path');
const libPath = 'build/Release/abi-stable-node.lib';
console.log(path.resolve(path.join(__dirname, libPath)));
