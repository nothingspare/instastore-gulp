(function () {
  'use strict';

  angular
      .module('instastore')
      .service('TourService', TourService);

  TourService.$inject = ['$rootScope', 'VerifyService', '$mdDialog', '$mdMedia', 'SubscriptionService', 'ItemService', 'ModalService'];
  /* @ngInject */
  function TourService($rootScope, VerifyService, $mdDialog, $mdMedia, SubscriptionService, ItemService, ModalService) {
    this.init = init;
    this.addItem = addItem;

    ////////////////

    function init() {
      // $rootScope.$on('$stateChangeStart',
      //     function (event, toState, toParams, fromState, fromParams, options) {
      // isGetFollowers().then(function (countFollowers) {
      isGetItems().then(function (countItems) {
        var countFollowers = isGetFollowers();
        debugger;
        if (!countItems && !countFollowers && !VerifyService.isVerify()) {
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
      // });
      // });
    }

    function addItem() {
      $rootScope.tour = {addItem: true};

      console.log($rootScope.store);

      isGetItems().then(function (count) {
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

    function isGetItems() {
      return ItemService.count();
    }

    function isGetFollowers() {
      console.log($rootScope.store);
      return $rootScope.store.followersAmount;
      // return SubscriptionService.count();
    }

  }

  angular
      .module('instastore')
      .controller('DialogController2', DialogController);

  DialogController.$inject = ['$mdDialog', 'SubscriptionService', 'VerifyService', 'TourService', 'ModalService'];

  /* @ngInject */
  function DialogController($mdDialog, SubscriptionService, VerifyService, TourService, ModalService) {
    var vm = this;

    vm.selectedItem = [];

    vm.hide = hide;
    vm.buy = buy;
    vm.sell = sell;

    function hide() {
      $mdDialog.hide();
    }

    function buy() {
      hide();
      SubscriptionService.isFollowing().then(function () {
        ModalService.showFinishSettings();
      });
    }

    function sell() {
      VerifyService.showModalAddressPhone().then(function () {
        TourService.addItem();
      });
    }
  }

})
();

