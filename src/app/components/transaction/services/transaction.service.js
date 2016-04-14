(function (angular) {
  'use strict';

  angular.module('instastore')
      .service('transactionService', TransactionService);

  TransactionService.$inject = ['rest'];

  function TransactionService(rest) {
    var service = {
      seller: seller,
      buyer: buyer,
      getCount: getCount
    };
    return service;

    ////////////

    function getCount() {
        rest.path = 'v1/my-transactions';
        return rest.models({
          type: 'active'
        });
    }

    function seller() {
      rest.path = 'v1/my-transactions';
      return rest.models({
        type: 'seller'
      }).success(function (result) {
        if (result) {
          return result.data;
        }
      });
    }

    function buyer() {
      rest.path = 'v1/my-transactions';
      return rest.models({
        type: 'buyer'
      }).success(function (result) {
        if (result) {
          return result.data;
        }
      });
    }
  }

})(angular);