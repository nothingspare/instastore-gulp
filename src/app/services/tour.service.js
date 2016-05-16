(function () {
  'use strict';

  angular
      .module('instastore')
      .service('TourService', TourService);

  TourService.$inject = ['$rootScope', 'VerifyService', '$mdDialog', '$mdMedia', 'ItemService', 'ModalService', 'UserService', 'SubscriptionService'];
  /* @ngInject */
  function TourService($rootScope, VerifyService, $mdDialog, $mdMedia, ItemService, ModalService, UserService, SubscriptionService) {
    this.init = init;
    this.addItem = addItem;

    ////////////////

    function init() {
      var profile = UserService.getProfile();
      if (profile.seller) {
        ItemService.count().then(function (countItems) {
          if(!countItems) {
            SubscriptionService.count().then(function (countFollowers) {
              if (!countFollowers && !VerifyService.isVerify()) {
                $mdDialog.show({
                  controller: 'DialogController2 as vm',
                  templateUrl: 'app/components/modal/welcome.html',
                  parent: angular.element(document.body),
                  clickOutsideToClose: true,
                  bindToController: true,
                  fullscreen: $mdMedia('xs')
                });
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
          $mdDialog.show({
            controller: 'DialogController2 as vm',
            templateUrl: 'app/components/modal/add-items.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            bindToController: true,
            fullscreen: $mdMedia('xs'),
            onRemoving: function () {
              ModalService.showFinishSettings();
            }
          });
        }
      });
    }
  }

  angular
      .module('instastore')
      .controller('DialogController2', DialogController);

  DialogController.$inject = ['$mdDialog', 'SubscriptionService', 'VerifyService', 'TourService', 'UserService'];

  /* @ngInject */
  function DialogController($mdDialog, SubscriptionService, VerifyService, TourService, UserService) {
    var vm = this;

    vm.profile = UserService.getProfile();

    vm.selectedItem = [];

    vm.hide = hide;
    vm.buy = buy;
    vm.sell = sell;

    function hide() {
      $mdDialog.hide();
    }

    function buy() {
      hide();
      SubscriptionService.isFollowing();
    }

    function sell() {
      VerifyService.showModalAddressPhone().then(function () {
        TourService.addItem();
      });
    }
  }

})
();

