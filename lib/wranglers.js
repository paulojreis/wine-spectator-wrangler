var _               = require('lodash'),
    wranglerModule  = {
        getCountryShareGlobal   : getCountryShareGlobal,
        getCountrySharePerYear  : getCountrySharePerYear,
        getMedianPricePerYear   : getMedianPricePerYear,
        getWineryShareGlobal    : getWineryShareGlobal,
        getCheapestWines        : getCheapestWines,
        getCheapestWinePerYear  : getCheapestWinePerYear,
        getTopWineries          : getTopWineries,
        getColorShareGlobal     : getColorShareGlobal
    };

function getCountryShareGlobal (rawData) {
    return _(rawData)
                .pluck('ranking')
                .flatten()
                .countBy('country').value();
}

function getCountrySharePerYear (rawData) {
    return _.map(rawData, function (value) {
        var yearData = value.ranking,
            yearShare = {
                year: value.year,
                countries: {}
            };

        yearShare.countries = _.countBy(yearData, 'country');

        return yearShare;
    });
}

function getMedianPricePerYear (rawData) {
    return _(rawData)
                .map(function (yearData, index, collection) {
                    var sortedPrices    =  _(yearData.ranking).sortBy('price').pluck('price').value(),
                        halfwayIndex    = (sortedPrices.length / 2) | 0,
                        median          = sortedPrices.length % 2 ?
                                            sortedPrices[halfwayIndex] :
                                            (sortedPrices[halfwayIndex] + sortedPrices[halfwayIndex - 1]) / 2;

                    return {
                        year    : yearData.year,
                        median  : median
                    };
                })
                .sortBy('year')
                .value();
}

function getWineryShareGlobal (rawData) {
    return _(rawData)
                .pluck('ranking')
                .flatten()
                .map(function (value) {
                    return _.pick(value, [ 'winery_full', 'country' ]);
                })
                .reduce(function (accum, value) {
                    var wineryNormalized = _.find(accum, value);

                    if (wineryNormalized) {
                        wineryNormalized.count++;
                    } else {
                        wineryNormalized = {
                            winery_full: value.winery_full,
                            country: value.country,
                            count: 1
                        };

                        accum.push(wineryNormalized);
                    }
                    
                    return accum;
                }, []);
}

function getCheapestWines (rawData, threshold) {
    return _(rawData)
                .map(function (yearData) {
                    return {
                        year: yearData.year, 
                        wines: _.filter(yearData.ranking, function (wine) {
                            return wine.price < threshold;                                        
                        })
                    };
                })
                .value();
}

function getCheapestWinePerYear (rawData) {
    return _(rawData)
                .map(function (yearData) {
                    return {
                        year: yearData.year, 
                        wine: _(yearData.ranking)
                                .sortBy('price')
                                .first()
                    };
                })
                .value();
}

function getTopWineries (rawData) {
    return _(getWineryShareGlobal(rawData))
                .filter(function (value) {
                    return value.count > 10;
                })
                .sortBy('count')
                .reverse()
                .value();
}

function getColorShareGlobal (rawData) {
    return _(rawData)
                .pluck('ranking')
                .flatten()
                .countBy('color')
                .value();
}

module.exports = wranglerModule;

