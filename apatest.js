var util = require('util'),
    OperationHelper = require('apac').OperationHelper;

var opHelper = new OperationHelper({
    awsId:     'AKIAIQ2GUZ4QA2PP25XA',
    awsSecret: '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',
    assocId:   'wwwciseufledu-20'
    // xml2jsOptions: an extra, optional, parameter for if you want to pass additional options for the xml2js module. (see https://github.com/Leonidas-from-XIV/node-xml2js#options)
});


// execute(operation, params, callback, onError)
// operation: select from http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SummaryofA2SOperations.html
// params: parameters for operation (optional)
// callback(parsed, raw): callback function handling results. parsed = xml2js parsed response. raw = raw xml response
// onError: function handling errors, otherwise all error messages are printed with console.log()

opHelper.execute('ItemSearch', {
  'SearchIndex': 'Books',
  'Keywords': 'harry potter',
  'ResponseGroup': 'ItemAttributes,Offers'
}, function(results) { // you can add a second parameter here to examine the raw xml response
    console.log(results);
});

// output:
// { ItemSearchResponse: 
//    { '$': { xmlns: 'http://webservices.amazon.com/AWSECommerceService/2011-08-01' },
//      OperationRequest: [ [Object] ],
//      Items: [ [Object] ] } }