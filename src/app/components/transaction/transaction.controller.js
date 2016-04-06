(function (angular) {
  'use strict';

  var app = angular
      .module('instastore');

  app.controller('TransactionCtrl', TransactionCtrl);

  TransactionCtrl.$inject = ['transactionService', 'errorService'];

  function TransactionCtrl(TransactionService, errorService) {
    var vm = this;

    vm.all = false;
    vm.active = false;
    vm.archive = false;

    init();

    function init() {
      TransactionService.all()
          .then(function (result) {
            vm.all = result;
          })
          .catch(errorService.alert);

      TransactionService.active()
          .then(function (result) {
            vm.active = result;
          })
          .catch(errorService.alert);

      TransactionService.archive()
          .then(function (result) {
            vm.archive = result;
          })
          .catch(errorService.alert);
    }

    vm.headers = [
      {
        name: '',
        field: 'image_url'
      },
      {
        name: 'Title',
        field: 'title'
      },
      {
        name: 'Status',
        field: 'last_status'
      },
      {
        name: 'Last date',
        field: 'last_created_at'
      }
    ];

    vm.sortable = ['status', 'description', 'last_modified'];

    vm.custom = {
      name: 'bold',
      description: 'grey',
      last_modified: 'grey'
    };

  }

})(angular);