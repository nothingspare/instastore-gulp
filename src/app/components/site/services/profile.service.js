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
      if (!InAppService.isFacebookInApp()) {
        $mdDialog.show({
          controller: 'ProfileIndex',
          templateUrl: 'app/components/profile/profile.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: $mdMedia('xs')
        });
      }
      else {
        InAppService.warnIfInApp();
      }
    }
  }

})();