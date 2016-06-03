(function () {
  'use strict';

  angular
      .module('instastore')
      .service('ProfileService', ProfileService);

  ProfileService.$inject = [
    'rest',
    'UserService',
    'messageService',
    '$rootScope',
    'TourService'
  ];

  /* @ngInject */
  function ProfileService(rest, UserService, messageService, $rootScope, TourService) {
    var service = {
      path: 'v1/profiles',
      makeSeller: makeSeller
    };

    return service;

    ////////////////

    function makeSeller(val) {
      if (val === 'demo') {

        var profile = UserService.getProfile();
        profile.status = 20;

        rest.path = service.path;
        return rest.putModel(profile).success(function (profile) {
              messageService.simpleByCode('profile', 'saved');
              UserService.setProfile(profile);
              UserService.setIsSeller(true);
              $rootScope.store = profile.store;
              UserService.goToMainStore();
              TourService.sell();
            }
        ).error(messageService.profile);
      }
    };
  }

})();

