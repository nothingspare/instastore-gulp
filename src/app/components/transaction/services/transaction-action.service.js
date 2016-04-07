(function (angular) {
  'use strict';

  angular.module('instastore')
      .service('transactionActionService', TransactionActionService);

  TransactionActionService.$inject = ['rest', '$mdDialog', '$mdMedia', 'messageService'];

  function TransactionActionService(rest, $mdDialog, $mdMedia, messageService) {
    var service = {
      getLabel: getLabel
    };
    return service;

    ////////////

    function getLabel(transaction) {
      // $location.hash('start');
      rest.path = 'v1/link/label';
      // $scope.isellBox = isell.box;
      return rest.postModel({
        buyerId: transaction.buyer_id,
        itemId: transaction.item_id,
        itemSellId: transaction.itemsell_id
      }).success(function (label) {
        // if (label.label) {
        //   var found = $filter('getById')($scope.item.itemSells, isell.id);
        //   found.itemSellTransactions.push({status: 30});
        // }
        var model = {};
        model.label = label;
        model.isellBox = transaction.itemsell_box;
        $mdDialog.show({
          templateUrl: 'app/components/item/label.html',
          parent: angular.element(document.body),
          scope: model,
          preserveScope: true,
          clickOutsideToClose: true,
          fullscreen: $mdMedia('xs')
        });
      }).error(messageService.alert);
    }

    // function active() {
    //   rest.path = 'v1/my-transactions';
    //   return rest.models({
    //     type: 'active'
    //   }).success(function (result) {
    //     if (result) {
    //       return result.data;
    //     }
    //   });
    // }
    //
    // function archive() {
    //   rest.path = 'v1/my-transactions';
    //   return rest.models({
    //     type: 'archive'
    //   }).success(function (result) {
    //     if (result) {
    //       return result.data;
    //     }
    //   });
    // }
  }

})(angular);