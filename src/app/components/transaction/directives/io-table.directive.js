(function (angular) {
  'use strict';

  angular
      .module('instastore')
      .directive('ioTable', ioTable);

  ioTable.$inject = [];

  function ioTable() {
    var directive = {
      link: link,
      templateUrl: 'app/components/transaction/directives/io-table.html',
      restrict: 'EA',
      transclude: true,
      scope: {
        headers: '=',
        content: '=',
        thumbs: '=?',
        count: '=?',
        searchLabel: '@?',
        sortable: '='
      }
    };
    return directive;

    function link(scope, element, attrs) {
      scope.searchLabel = 'Transactions';
      scope.thumbs = 'image_url';
      scope.count = 10;
      scope.toggleSearch = false;
    }
  }

})(angular);