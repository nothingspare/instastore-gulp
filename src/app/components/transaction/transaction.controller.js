(function (angular) {
  'use strict';

  var app = angular
      .module('instastore');

  app.controller('TransactionCtrl', TransactionCtrl);

  TransactionCtrl.$inject = ['transactionService', 'messageService'];

  function TransactionCtrl(TransactionService, messageService) {
    var vm = this;

    vm.all = false;
    vm.active = false;
    vm.archive = false;

    init();

    function init() {
      TransactionService.active()
          .success(function (result) {
            vm.active = result;
            TransactionService.all()
                .success(function (result) {
                  vm.all = result;
                  TransactionService.archive()
                      .success(function (result) {
                        vm.archive = result;
                      })
                      .error(messageService.alert);
                })
                .error(messageService.alert);
          })
          .error(messageService.alert);
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

  }

  )(angular);