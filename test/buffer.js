'use strict';
const buildType = process.config.target_defaults.default_configuration;
const binding = require(`./build/${buildType}/binding.node`);
const assert = require('assert');

function doAsync(cb, work) {
   setTimeout(() => {
      try {
         work();
      } catch (e) {
         cb(e);
         return;
      }
      cb();
   });
}

module.exports.test = function(cb) {
   let test = binding.buffer.createBuffer();
   binding.buffer.checkBuffer(test);
   assert.ok(test instanceof Buffer);

   let test2 = Buffer.alloc(test.length);
   test.copy(test2);
   binding.buffer.checkBuffer(test2);

   test = binding.buffer.createBufferCopy();
   binding.buffer.checkBuffer(test);
   assert.ok(test instanceof Buffer);

   test = binding.buffer.createExternalBuffer();
   binding.buffer.checkBuffer(test);
   assert.ok(test instanceof Buffer);

   test = binding.buffer.createExternalBufferWithFinalize();
   binding.buffer.checkBuffer(test);
   assert.ok(test instanceof Buffer);
   assert.strictEqual(0, binding.buffer.getFinalizeCount());
   test = null;
   doAsync(cb, () => {
      try {
         global.gc();
         assert.strictEqual(1, binding.buffer.getFinalizeCount());

         test = binding.buffer.createExternalBufferWithFinalizeHint();
         binding.buffer.checkBuffer(test);
         assert.ok(test instanceof Buffer);
         assert.strictEqual(1, binding.buffer.getFinalizeCount());
         test = null;
         setTimeout(() => {
            try {
            global.gc();
            assert.strictEqual(2, binding.buffer.getFinalizeCount());
            cb();
         });
      } catch (e) {
         cb(e);
      }
   });
};
