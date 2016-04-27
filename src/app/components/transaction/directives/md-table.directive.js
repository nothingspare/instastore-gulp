(function (angular) {
  'use strict';

  angular
      .module('instastore')
      .directive('mdTable', mdTable);

  mdTable.$inject = ['$filter', 'ITEMSELLTRANSACTION_STATUS'];

  function mdTable($filter, IT_STATUS) {
    var directive = {
      link: link,
      templateUrl: 'app/components/transaction/directives/md-table.html',
      restrict: 'EA',
      scope: {
        headers: '=',
        content: '=',
        sortable: '=',
        filters: '=',
        customClass: '=customClass',
        thumbs: '=',
        count: '='
      }
    };
    return directive;

    function link($scope) {
      $scope.$filter = $filter;
      $scope.IT_STATUS = IT_STATUS;

      var orderBy = $filter('orderBy');
      $scope.tablePage = 0;
      $scope.nbOfPages = function () {
        if ($scope.content) {
          return Math.ceil($scope.content.length / $scope.count);
        }
      };
      $scope.handleSort = function (field) {
        return $scope.sortable.indexOf(field) > -1;
      };
      $scope.order = function (predicate, reverse) {
        $scope.content = orderBy($scope.content, predicate, reverse);
        $scope.predicate = predicate;
      };
      $scope.order($scope.sortable[0]);
      $scope.getNumber = function (num) {
        return new Array(num);
      };
      $scope.goToPage = function (page) {
        $scope.tablePage = page;
      };
    }
  }
})(angular);