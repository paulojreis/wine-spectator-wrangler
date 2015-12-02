var _               = require('lodash'),
    wranglerModule  = {
        getCountryShareGlobal   : getCountryShareGlobal,
        getCountrySharePerYear  : getCountrySharePerYear,
        getMedianPricePerYear   : getMedianPricePerYear
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

module.exports = wranglerModule;

