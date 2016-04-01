(function (angular) {
  'use strict';

  angular
      .module('instastore')
      .directive('ioTable', ioTable);

  ioTable.$inject = [];

  function ioTable() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/transaction/directives/io-table.html',
      scope: {
        headers: '=',
        content: '=',
        thumbs: '=?',
        count: '=?',
        searchLabel: '@?',
        sortable: '='
      },
      link: function ($scope, element, attrs) {
        $scope.searchLabel = 'Transactions';
        $scope.thumbs = 'thumb';
        $scope.count = 10;
        $scope.toggleSearch = false;
      }
    };
  }

})(angular);