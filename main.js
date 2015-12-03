var http        = require('http'),
    fs          = require('fs'),
    _           = require('lodash'),
    wranglers   = require('./lib/wranglers.js'),
    BASE_URL    = 'http://assets.mshanken.com/wso/2015100t/json/',
    YEAR_START  = 1988,
    YEAR_END    = new Date().getFullYear(),
    years       = _.range(YEAR_START, YEAR_END + 1);

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

function preProcessData (allYearsData) {
    var rawData             = _.sortBy(allYearsData, 'year'),
        countryShareGlobal  = wranglers.getCountryShareGlobal(rawData),
        countrySharePerYear = wranglers.getCountrySharePerYear(rawData),
        medianPricePerYear  = wranglers.getMedianPricePerYear(rawData);
        wineryShareGlobal   = wranglers.getWineryShareGlobal(rawData);
        topWineries         = wranglers.getTopWineries(rawData);
        colorShareGlobal    = wranglers.getColorShareGlobal(rawData);

    fs.writeFile('data.json',                   JSON.stringify(rawData));

    fs.writeFile('countryShareGlobal.json',     JSON.stringify(countryShareGlobal));
    fs.writeFile('countrySharePerYear.json',    JSON.stringify(countrySharePerYear));
    fs.writeFile('medianPricePerYear.json',     JSON.stringify(medianPricePerYear));
    fs.writeFile('wineryShareGlobal.json',      JSON.stringify(wineryShareGlobal));
    fs.writeFile('topWineries.json',            JSON.stringify(topWineries));
    fs.writeFile('colorShareGlobal.json',       JSON.stringify(colorShareGlobal));
}