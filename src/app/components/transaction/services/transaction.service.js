(function (angular) {
  'use strict';

  angular.module('instastore')
      .service('transactionService', TransactionService);

  TransactionService.$inject = ['rest', 'API_URL', 'UserService', 'errorService'];

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
      return rest.models({}).then(function (result) {
        if (result) {
          return result.data;
        }
      });
    }

    function active() {
      rest.path = 'v1/my-transactions';
      return rest.models({
        type: 'active'
      }).then(function (result) {
        if (result) {
          return result.data;
        }
      });
    }

    function archive() {
      rest.path = 'v1/my-transactions';
      return rest.models({
        type: 'archive'
      }).then(function (result) {
        if (result) {
          return result.data;
        }
      });
    }
  }

})(angular);