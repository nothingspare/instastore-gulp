(function (angular) {
  'use strict';

  angular.module('instastore')
      .service('transactionActionService', TransactionActionService);

  TransactionActionService.$inject = ['rest', 'ITEMSELLTRANSACTION_STATUS'];

  function TransactionActionService(rest, IT_STATUS) {
    var service = {
      getLabel: getLabel,
      emailLabel: emailLabel,
      changeItemStatus: changeItemStatus
    };
    return service;

    ////////////

    function getLabel(transaction) {
      // $location.hash('start');
      rest.path = 'v1/link/label';
      return rest.postModel({
        buyerId: transaction.buyer_id,
        itemId: transaction.item_id,
        itemSellId: transaction.itemsell_id
      });
    }

    function emailLabel(isellId) {
      rest.path = 'v1/link/label-send';
      return rest.postModel({
        isellId: isellId
      });
    }

    function changeItemStatus(transaction, status, boxSize) {
      rest.path = 'v1/item-sell-transactions';
      var req = {
        itemsell_id: transaction.itemsell_id,
        status: status
      };

      if (status === IT_STATUS.send && boxSize) {
        req.box = parseInt(boxSize)
      }

      return rest.postModel(req);
    }

  }

})(angular);