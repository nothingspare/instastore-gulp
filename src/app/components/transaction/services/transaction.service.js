(function (angular) {
  'use strict';

  angular.module('instastore')
      .service('transactionService', TransactionService);

  TransactionService.$inject = ['rest'];

  function TransactionService(rest) {
    var service = {
      seller: seller,
      buyer: buyer,
      getActiveCount: getActiveCount,
      getCount: getCount,
      viewCount: viewCount,
      activeCount: 0,
      count: 0
    };
    return service;

    ////////////

    function getCount() {
      rest.path = 'v1/my-transactions';
      return rest.models({
        type: 'count'
      }).success(function (res) {
        service.count = res;
      });
    }

    function getActiveCount() {
        rest.path = 'v1/my-transactions';
        return rest.models({
          type: 'active'
        }).success(function (res) {
          service.activeCount = res;
        });
    }

    function viewCount(ids) {
      rest.path = 'v1/my-transactions/update-view';
      return rest.postModel({
        ids: ids
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