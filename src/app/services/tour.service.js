(function () {
  'use strict';

  angular
      .module('instastore')
      .service('TourService', TourService);

  TourService.$inject = ['$rootScope', 'VerifyService', 'ItemService', 'ModalService',
    'UserService', 'SubscriptionService', 'deviceDetector'];
  /* @ngInject */
  function TourService($rootScope, VerifyService, ItemService, ModalService, UserService, SubscriptionService, deviceDetector) {
    this.init = init;
    this.sell = sell;
    this.addItem = addItem;

    ////////////////

    function init() {
      ItemService.count().then(function (countItems) {
        if (!countItems) {
          SubscriptionService.count().then(function (countFollowers) {
            if (!countFollowers && !VerifyService.isVerify()) {
              ModalService.show('welcome');
            }
          });
        }
      });
    }

    function addItem() {
      $rootScope.tour = {addItem: true};
      ItemService.count().then(function (count) {
        if (!count) {
          ModalService.show('add-items').then(function () {
            ModalService.show('finish-settings').then(function () {
              if (deviceDetector.os === 'ios') {
                ModalService.show('home-screen');
              }
            });
          });
        }
      });
    }

    function sell() {
      var profile = UserService.getProfile();
      if (profile.seller) {
        ModalService.show('profile-verify')
            .then(function () {
              if (VerifyService.isVerify()) {
                addItem();
              }
            });
      } else {
        ModalService.show('apply-for-store');
      }
    }
  }

})
();

