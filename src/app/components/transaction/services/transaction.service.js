(function (angular) {
  'use strict';

  angular.module('instastore')
      .service('transactionService', TransactionService);

  TransactionService.$inject = ['rest'];

  function TransactionService(rest) {
    var service = {
      all: all,
      active: active,
      archive: archive
    };
    return service;

    ////////////

    function all() {
      rest.path = 'v1/my-transactions';
      return rest.models({}).success(function (result) {
        if (result) {
          return result.data;
        }
      });
    }

    function active() {
      rest.path = 'v1/my-transactions';
      return rest.models({
        type: 'active'
      }).success(function (result) {
        if (result) {
          return result.data;
        }
      });
    }

    function archive() {
      rest.path = 'v1/my-transactions';
      return rest.models({
        type: 'archive'
      }).success(function (result) {
        if (result) {
          return result.data;
        }
      });
    }
  }

})(angular);