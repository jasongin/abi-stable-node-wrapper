'use strict';

if (typeof global.gc !== 'function') {
   throw new Error('Tests require --expose-gc flag.')
}

let testModules = [
   'arraybuffer',
   'asyncworker',
   'buffer',
   'error',
   'external',
   'function',
   'name',
];

process.exitCode = 0;

let testPromise = new Promise((resolve, reject) => resolve());

testModules.forEach(name => {
   testPromise = testPromise.then(
      () => {

      },
      (e) => {

      });

   try {
      process.stdout.write('Testing ' + name + '...' +
         Array(15 - name.length).join(' '));
      const testModule = require('./' + name);
      if (typeof testModule.test === 'function') {
         const result = testModule.test();
         if (result instanceof Promise) {
            result.then(
               () => {
                  process.stdout.write('OK\n');
               }, (e) => {

               });
         } else {
            process.stdout.write('OK\n');
         }
         testModule.test((err) => {
            if (!err) {
            } else {
               process.stdout.write('FAILED\n');
               console.error(e);
               process.exitCode = 1;
            }
         });
      } else {
         process.stdout.write('OK\n');
      }
   }
   catch (e) {
      process.stdout.write('FAILED\n');
      console.error(e);
      process.exitCode = 1;
   }
});
