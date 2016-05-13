(function () {
  'use strict';

  angular
      .module('instastore')
      .service('ModalService', ModalService);

  ModalService.$inject = ['$mdDialog', '$mdMedia'];

  /* @ngInject */
  function ModalService($mdDialog, $mdMedia) {
    this.showFinishSettings = showFinishSettings;

    ////////////////

    function showFinishSettings() {
      $mdDialog.show({
        controller: 'DialogController2 as vm',
        templateUrl: 'app/components/modal/finish-settings.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        bindToController: true,
        fullscreen: $mdMedia('xs')
      });
    }
  }

})();

