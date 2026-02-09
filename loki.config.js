module.exports = {
    "configurations": {
        "chrome.laptop": {
            "target": "chrome.docker",
            "width": 1366,
            "height": 768,
            "deviceScaleFactor": 1,
            "mobile": false
        },
        "chrome.iphone7": {
            "target": "chrome.docker",
            "preset": "iPhone 7"
        }
    },
    "diffingEngine": "pixelmatch",
    "fileNameFormatter": ({ configurationName, kind, story }) =>
        `${configurationName}/${kind}/${story}`,
};
