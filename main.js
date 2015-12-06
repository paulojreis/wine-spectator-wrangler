var http            = require('http'),
    fs              = require('fs'),
    _               = require('lodash'),
    wranglers       = require('./lib/wranglers.js'),
    server          = require('./lib/server.js'),
    cliArgs         = process.argv.slice(2),
    shouldServe     = false,
    serveAt         = undefined,
    BASE_URL        = 'http://assets.mshanken.com/wso/2015100t/json/',
    YEAR_START      = 1988,
    YEAR_END        = new Date().getFullYear(),
    years           = _.range(YEAR_START, YEAR_END + 1);

if (cliArgs.length &&
    cliArgs.length < 3 &&
    (cliArgs[0] === '-s' || cliArgs[0] === '--serve')) {
        
    shouldServe = true;
    
    if (cliArgs.length > 1 &&
        _.isNumber(+cliArgs[1])) {

        serveAt = +cliArgs[1];
    }
}

Promise
    .all(years.map(getHTTPPromiseFromYear))
    .then(preProcessData);

function getHTTPPromiseFromYear (year) {
    return new Promise(function (resolve, reject) {
        http.get(BASE_URL + year + '.json', function (response) {
            var responseData = '';

            response.on('data', function (chunk) {
                responseData += chunk
            });

            response.on('end', function () {
                resolve({
                    year    : year,
                    ranking : JSON.parse(responseData)
                });
            });
        });
    });
}

function getFSWritePromise (path, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(path, data, function (err) {
            resolve();
        });
    });
}

function getFSFolderExistsOrCreatePromise (folder) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(folder, function (err, a) {
            if (!err || err.code === 'EEXIST') {
                resolve();
            }
        })
    });
}

function preProcessData (allYearsData) {
    var rawData             = _.sortBy(allYearsData, 'year'),
        countryShareGlobal  = wranglers.getCountryShareGlobal(rawData),
        countrySharePerYear = wranglers.getCountrySharePerYear(rawData),
        medianPricePerYear  = wranglers.getMedianPricePerYear(rawData);
        wineryShareGlobal   = wranglers.getWineryShareGlobal(rawData);
        topWineries         = wranglers.getTopWineries(rawData);
        colorShareGlobal    = wranglers.getColorShareGlobal(rawData);

    getFSFolderExistsOrCreatePromise('data')
        .then(Promise.all([
            getFSWritePromise('./data/data.json',                   JSON.stringify(rawData)),
            getFSWritePromise('./data/countryShareGlobal.json',     JSON.stringify(countryShareGlobal)),
            getFSWritePromise('./data/countrySharePerYear.json',    JSON.stringify(countrySharePerYear)),
            getFSWritePromise('./data/medianPricePerYear.json',     JSON.stringify(medianPricePerYear)),
            getFSWritePromise('./data/wineryShareGlobal.json',      JSON.stringify(wineryShareGlobal)),
            getFSWritePromise('./data/topWineries.json',            JSON.stringify(topWineries)),
            getFSWritePromise('./data/colorShareGlobal.json',       JSON.stringify(colorShareGlobal))
        ]))
        .then(function () {
            if (shouldServe) {
                server.registerFile('data',                      './data/data.json');
                server.registerFile('countryShareGlobal',        './data/countryShareGlobal.json');
                server.registerFile('countrySharePerYear',       './data/countrySharePerYear.json');
                server.registerFile('medianPricePerYear',        './data/medianPricePerYear.json');
                server.registerFile('wineryShareGlobal',         './data/wineryShareGlobal.json');
                server.registerFile('topWineries',               './data/topWineries.json');
                server.registerFile('colorShareGlobal',          './data/colorShareGlobal.json');

                server.startServer(serveAt);
            }
        })
}