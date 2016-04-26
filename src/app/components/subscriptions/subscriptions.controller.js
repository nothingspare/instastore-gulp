(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('SubscriptionsMain', SubscriptionsMain);

  SubscriptionsMain.$inject = [
    'UserService',
    'SubscriptionService',
    'StoreService',
    'FollowerService',
    '$rootScope'
  ];

  /* @ngInject */
  function SubscriptionsMain(UserService, SubscriptionService, StoreService, FollowerService, $rootScope) {
    var vm = this;

    vm.searchText = '';
    vm.selectedStore;
    vm.profile = UserService.getProfile();

    vm.follow = follow;
    vm.unfollow = unfollow;
    vm.querySearch = querySearch;
    vm.change = change;

    UserService.initMyStoreSettings();
    activate();

    ////////////////

    function change() {
      console.log(vm.selectedStore);
    }

    function activate() {
      getAll().then(function () {
        getAllRecommended();
      });
    }

    function getAll() {
      return SubscriptionService.all()
          .success(function (data) {
            vm.subs = data;
          })
    }

    function getAllRecommended() {
      SubscriptionService.recommended()
          .success(function (data) {
            vm.subsRecommended = data;
          })
    }

    function follow(storeId, event) {
      if(event) {
        event.stopPropagation();
      }

      FollowerService.follow(storeId)
          .then(function () {
            vm.searchText = '';
            activate();
          });
    }

    function unfollow(storeId, event) {
      if(event) {
        event.stopPropagation();
      }

      FollowerService.unfollow(storeId)
          .then(function () {
            vm.searchText = '';
            activate();
          });
    }

    function querySearch(text) {
      return StoreService.search(text)
          .then(function (data) {
            return data;
          });
    }
  }

})();
