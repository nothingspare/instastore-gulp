(function (angular) {
  'use strict';

  angular
      .module('instastore')
      .directive('mdTable', mdTable);

  mdTable.$inject = ['$filter'];

  function mdTable($filter) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/transaction/directives/md-table.html',
      scope: {
        headers: '=',
        content: '=',
        sortable: '=',
        filters: '=',
        customClass: '=customClass',
        thumbs: '=',
        count: '='
      },
      link: function ($scope) {
        var orderBy = $filter('orderBy');
        $scope.tablePage = 0;
        $scope.nbOfPages = function () {
          return Math.ceil($scope.content.length / $scope.count);
        };
        $scope.handleSort = function (field) {
          return $scope.sortable.indexOf(field) > -1;
        };
        $scope.order = function (predicate, reverse) {
          $scope.content = orderBy($scope.content, predicate, reverse);
          $scope.predicate = predicate;
        };
        $scope.order($scope.sortable[0], false);
        $scope.getNumber = function (num) {
          return new Array(num);
        };
        $scope.goToPage = function (page) {
          $scope.tablePage = page;
        };
      }
    }
  }
})(angular);