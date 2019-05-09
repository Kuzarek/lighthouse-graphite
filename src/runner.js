const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const mapper = require('./result-mapper');
const index = require('./index')
const fs = require('fs');

const date = new Date().toISOString().slice(0, 19);
const formatedDate = date.replace(/:/g, '-');
const re = /([^\.]+).(.*?)\.([^\.]+)$/;

exports.run = (url, options, config = null) => {
    const path = url.match(re);
    // Creating folder from the page name (last word before `.`)
    if (!fs.existsSync(path[2])){
        fs.mkdirSync(path[2]);
    }
    return chromeLauncher.launch(options).then(chrome => {
        options.port = chrome.port;
        return lighthouse(url, options, config)
            .then(result => chrome.kill()
                .then(() => {
                    if(index.name){
                        fs.writeFile(`reports/${path[2]}/${index.name}-${formatedDate}.${index.extension}`, result.report, error => { if (error) { throw error; }})}
                    })
                .then(() => mapper.map(result.lhr)))
            .catch((error) => {
                if (chrome) {
                    chrome.kill();
                }
                Promise.reject(error);
            });
    });
};
