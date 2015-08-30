'use strict';

angular.module('instastore')
    .value('app-version', '0.0.2')
    .constant('SLIDER_HEIGHT', 310)
    .constant('SLIDER_HEIGHT_EXTENDED', 390)
    .constant('ITEM_STATUS', {temp: 0, inactive: 10, active: 20})
    .constant('PLUPLOAD_RESIZE_CONFIG', {width: 620, height: 620, preserve_headers: false})
    .constant('ITEMSELLTRANSACTION_STATUS', {
        sold: 0,
        declined: 10,
        send: 20,
        sendFirstRemainder:21,
        sendSecondRemainder:22,
        sendThirdRemainder:23,
        saleCanceled:24,
        label: 30,
        receivedInPost: 40,
        arrived: 50,
        hurryup: 60,
        accepted: 70
    })
    .constant('angularMomentConfig', {
        preprocess: 'unix'
    });

switch (window.location.origin) {
    case 'http://isopen.us':
        angular.module('instastore')
            .constant('API_URL', 'http://api.isopen.us/')
            .constant('CLIENT_URL', 'http://isopen.us/');
        break;
    case 'http://instastore.us':
        angular.module('instastore')
            .constant('API_URL', 'http://api.instastore.us/')
            .constant('CLIENT_URL', 'http://instastore.us/');
        break;
    default:
        angular.module('instastore')
            .constant('API_URL', 'http://api.instastore.us/')
            .constant('CLIENT_URL', 'http://192.168.0.103:3000/');
        break;
}
