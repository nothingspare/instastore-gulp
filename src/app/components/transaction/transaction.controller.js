(function (angular) {
  'use strict';

  var app = angular
      .module('instastore');

  app.controller('TransactionCtrl', TransactionCtrl);

  TransactionCtrl.$inject = ['transactionService', 'messageService', 'UserService'];

  function TransactionCtrl(TransactionService, messageService, UserService) {
    var vm = this;

    vm.seller = false;
    vm.buyer = false;
    vm.isSeller = UserService.isSeller();
    vm.selectTab = selectTab;

    function selectTab(type) {
      if(type == 'buyer') {
        TransactionService.buyer()
            .success(function (result) {
              vm.buyer = result;
              console.log(vm.buyer);
            })
            .error(messageService.alert);
      } else if (type == 'seller') {
        TransactionService.seller()
            .success(function (result) {
              vm.seller = result;
            })
            .error(messageService.alert);
      }
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