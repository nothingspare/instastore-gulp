(function () {
  'use strict';

  angular
      .module('instastore')
      .service('profileService', ProfileService);

  ProfileService.$inject = ['InAppService', '$mdDialog', '$mdMedia'];

  function ProfileService(InAppService, $mdDialog, $mdMedia) {
    var service = {
      show: show
    };

    return service;

    function show(ev) {
      $mdDialog.show({
        controller: 'ProfileIndex',
        templateUrl: 'app/components/profile/profile.html',
        parent: angular.element(document.querySelector('.io-container')),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: $mdMedia('xs')
      });
    }
  }

})();