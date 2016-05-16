(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('ItemStream', ItemStream);

  ItemStream.$inject = [
    '$scope',
    'UserService',
    'StreamService',
    'SubscriptionService',
    '$mdDialog',
    '$mdMedia'
  ];

  /* @ngInject */
  function ItemStream($scope, UserService, StreamService, SubscriptionService, $mdDialog, $mdMedia) {

    var vm = this;
    vm.busy = true;
    vm.nextPage = nextPage;

    var page = 1;
    var pageCount;

    activate();

    ////////////////

    function nextPage() {
      ++page;
      if (pageCount >= page) {
        if (this.busy) return;
        vm.busy = true;
        StreamService.all(page).success(function (data) {
          vm.items = vm.items.concat(data);
          vm.busy = false;
        });
      }
    }

    function activate() {
      UserService.initMyStoreSettings();
      SubscriptionService.count().then(function (count) {
        if(!count) {
          SubscriptionService.isFollowing()
        }
        StreamService.all().then(function (data) {
          pageCount = parseInt(data.headers('X-Pagination-Page-Count'));
          vm.items = data.data;
          vm.busy = false;
        });
      });
      // if (UserService.isSeller()) {
      //   SubscriptionService.isFollowing().then(function () {
      //     StreamService.all().then(function (data) {
      //       pageCount = parseInt(data.headers('X-Pagination-Page-Count'));
      //       vm.items = data.data;
      //       vm.busy = false;
      //     });
      //   });
      // } else {
      //   StreamService.all().then(function (data) {
      //     pageCount = parseInt(data.headers('X-Pagination-Page-Count'));
      //     vm.items = data.data;
      //     vm.busy = false;
      //   });
      // }
    }
  }

})();
