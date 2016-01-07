'use strict';

var app = angular.module('instastore');

app
    .filter('boxSizeDimensions', [function () {
        return function (input) {
            switch (input) {
                case 10:
                    return '5.3/8" x 8.5/8" x 5.5/8"';
                case 20:
                    return '11.1/5" x 13.1/8" x 2.3/8"';
                case 30:
                    return '12" x 12" x 5.1/2"';
            }
        };
    }])
    .filter('boxSizeTitle', [function () {
        return function (input) {
            switch (input) {
                case 10:
                    return 'Small Box';
                    break;
                case 20:
                    return 'Medium Box';
                    break;
                case 30:
                    return 'Large Box';
                    break;
            }
        };
    }]);
