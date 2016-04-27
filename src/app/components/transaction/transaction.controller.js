(function (angular) {
  'use strict';

  var app = angular
      .module('instastore');

  app.controller('TransactionCtrl', TransactionCtrl);

  TransactionCtrl.$inject = ['transactionService', 'messageService', 'UserService', '$q'];

  function TransactionCtrl(TransactionService, messageService, UserService, $q) {
    var vm = this;

    vm.seller = false;
    vm.buyer = false;
    vm.isSeller = UserService.isSeller();
    vm.selectTab = selectTab;

    function selectTab(type) {
      if (type == 'buyer') {
        TransactionService.buyer()
            .success(function (result) {
              vm.buyer = result;
            })
            .error(messageService.alert)
            .then(changeViewCount);
      } else if (type == 'seller') {
        TransactionService.seller()
            .success(function (result) {
              vm.seller = result;
              return vm.seller;
            })
            .error(messageService.alert)
            .then(changeViewCount);
      }
    }

    function changeViewCount(res) {
      var ids = _.map(_.filter(res.data, {is_view: "0"}), 'itemselltransaction_id');
      if(!ids.length){
        return $q.when(false);
      }
      return TransactionService.viewCount(ids)
          .then(function (response) {
            TransactionService.count -= ids.length;
            return response;
          });
    }

    vm.headers = [
      {
        name: 'Status',
        field: 'last_status'
      },
      {
        name: '',
        field: 'image_url'
      }
    ];

    vm.sortable = ['last_status'];

    vm.custom = {
      name: 'bold',
      description: 'grey',
      last_modified: 'grey'
    };

  }

})(angular);