(function (angular) {
  'use strict';

  angular.module('instastore')
      .filter('startFrom', function () {
        return function (input, start) {
          if(input) {
            start = +start;
            return input.slice(start);
          }
        }
      });
})(angular);

