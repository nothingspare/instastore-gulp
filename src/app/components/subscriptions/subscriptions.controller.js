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
      SubscriptionService.isFollowing().then(function () {
        getAll().then(function () {
          getAllRecommended().then(function () {
            getOther();
          });
        });
      });
    }

    function getAll() {
      return SubscriptionService.all()
          .success(function (data) {
            vm.subs = data;
          })
    }

    function getAllRecommended() {
      return SubscriptionService.recommended()
          .success(function (data) {
            vm.subsRecommended = data;
          })
    }

    function getOther() {
      return SubscriptionService.other()
          .success(function (data) {
            vm.subsOther = data;
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
