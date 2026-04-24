/* global console */

const originalWarn = console.warn.bind(console);

console.warn = (...args) => {
    const firstArg = args[0];
    if (
        typeof firstArg === 'string' &&
        firstArg.includes('[baseline-browser-mapping]') &&
        firstArg.includes('The data in this module is over two months old')
    ) {
        return;
    }

    originalWarn(...args);
};
