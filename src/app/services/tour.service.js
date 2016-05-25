(function () {
  'use strict';

  angular
      .module('instastore')
      .service('TourService', TourService);

  TourService.$inject = ['$rootScope', 'VerifyService', 'ItemService', 'ModalService',
    'UserService', 'SubscriptionService'];
  /* @ngInject */
  function TourService($rootScope, VerifyService, ItemService, ModalService, UserService, SubscriptionService) {
    this.init = init;
    this.addItem = addItem;

    ////////////////

    function init() {
      var profile = UserService.getProfile();
      if (profile.seller) {
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
    }

    function addItem() {
      $rootScope.tour = {addItem: true};
      ItemService.count().then(function (count) {
        if (!count) {
          ModalService.show('add-items').then(function () {
            ModalService.show('finish-settings').then(function () {
              ModalService.show('home-screen');
            });
          });
        }
      });
    }
  }

})
();

