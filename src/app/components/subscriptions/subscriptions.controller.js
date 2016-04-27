(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('SubscriptionsMain', SubscriptionsMain);

  SubscriptionsMain.$inject = [
    'UserService',
    'SubscriptionService',
    'FollowerService',
    '$mdBottomSheet'
  ];

  /* @ngInject */
  function SubscriptionsMain(UserService, SubscriptionService, FollowerService, $mdBottomSheet) {
    var vm = this;

    vm.follow = follow;
    vm.unfollow = unfollow;

    UserService.initMyStoreSettings();
    activate();

    ////////////////

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
      if (event) {
        event.stopPropagation();
      }

      FollowerService.follow(storeId)
          .then(function () {
            vm.searchText = '';
            activate();
          });
    }

    function unfollow(storeId, event) {
      if (event) {
        event.stopPropagation();
      }

      FollowerService.unfollow(storeId)
          .then(function () {
            vm.searchText = '';
            activate();
          });
    }
  }

})();
