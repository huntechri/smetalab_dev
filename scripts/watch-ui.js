const nodemon = require('nodemon');

console.log('Starting Visual Regression Watcher...');

nodemon({
    watch: ['components', 'app'],
    ext: 'ts,tsx,css',
    ignore: ['*.stories.tsx', '*.test.ts', '*.test.tsx'],
    exec: 'pnpm test:ui',
});

nodemon.on('start', function () {
    console.log('Watcher: Looking for changes...');
}).on('restart', function (files) {
    console.log('Watcher: Files changed, running Loki tests:', files);
}).on('quit', function () {
    process.exit();
});
