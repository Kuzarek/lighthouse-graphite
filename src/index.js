#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const runner = require('./runner');
const aggregate = require('./result-aggregation');
const GraphiteClient = require('./graphite-client'); 

if (argv._.length !== 1) {
    console.error(
        'One and only one url must be provided (i.e. `lighthouse-graphite https://www.example.com`'
    );
    return;
}

const url = argv._[0];
const runs = argv.runs || 3;
const name = argv['name'];
const logLevel = argv['log-level'];
const extension = argv['output'] || 'html';
const throttlingMethod = argv['throttling-method'];
const cpuSlowdown = argv['cpu-slowdown-multiplier'] || 4;
const throughputMbps = argv['throughput-mbps'] || 1.6;
const maxWaitForLoad = argv['max-wait-for-load'] || 45000;
const emulatedFormFactor = argv['emulated-form-factor'] || 'mobile';
const disableStorageReset = argv['disable-storage-reset'] || 'false';
const chromeFlags = argv['chrome-flags'] ? argv['chrome-flags'].split(',') : [];
const graphiteHost = argv['graphite-host'];
const graphitePrefix = argv['graphite-prefix'] || '';
const metricsBlacklist = argv['metrics-blacklist'] ? argv['metrics-blacklist'].split(',') : [];
const functionBlacklist = argv['function-blacklist'] ? argv['function-blacklist'].split(',') : [];
const blockedUrlPatterns = argv['blocked-url-patterns']
    ? argv['blocked-url-patterns'].split(',')
    : [];

module.exports.name = argv['name'];
module.exports.extension = argv['output'] || 'html';

if (!graphiteHost) {
    console.warn('`--graphite-host` argument not defined, will skip sending metrics to graphite');
}

if (!name) {
    console.warn('`--name` argument was not provided, report will not be generated');
}

const options = {
    maxWaitForLoad: maxWaitForLoad,
    logLevel: logLevel,
    output: extension,
    chromeFlags: chromeFlags,
    emulatedFormFactor: emulatedFormFactor,
    throttlingMethod: throttlingMethod,
    disableStorageReset: disableStorageReset,
    throttling: {
        rttMs: 150,
        throughputKbps: throughputMbps * 1024,
        cpuSlowdownMultiplier: cpuSlowdown,
      },
};
const config = {
    extends: 'lighthouse:default',
    passes: [
        {
            blockedUrlPatterns,
        },
    ],
};

const results = [];

(async () => {
    try {
        for (let i = 0; i < runs; i++) {
            const result = await runner.run(url, options, config);
            results.push(result);
        }

        const aggregatedResults = aggregate(results, metricsBlacklist, functionBlacklist);

        if (graphiteHost) {
            const graphiteClient = new GraphiteClient(graphiteHost, graphitePrefix);
            await graphiteClient.send(aggregatedResults);
        }

        console.log(aggregatedResults);
    } catch (error) {
        console.error(error);
    }
})();
