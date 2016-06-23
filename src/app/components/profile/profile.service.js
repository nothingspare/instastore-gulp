(function () {
  'use strict';

  angular
      .module('instastore')
      .service('ProfileService', ProfileService);

  ProfileService.$inject = [
    'rest',
    'UserService',
    'messageService',
    '$rootScope'
  ];

  /* @ngInject */
  function ProfileService(rest, UserService, messageService, $rootScope) {
    var service = {
      path: 'v1/profiles',
      makeSeller: makeSeller,
      loginInstagram: loginInstagram
    };

    return service;

    ////////////////

    function makeSeller() {
      var profile = UserService.getProfile();
      profile.status = 20;
      rest.path = service.path;

      return rest.putModel(profile)
          .success(function (profile) {
                messageService.simpleByCode('profile', 'saved');
                UserService.setProfile(profile);
                UserService.setIsSeller(true);
                $rootScope.store = profile.store;
                UserService.goToMainStore();
              }
          ).error(messageService.profile);
    }

    function loginInstagram(username, password) {
      rest.path = 'v1/link/instagram-login';
      return rest.postModel({
        username: username,
        password: password
      })
          .error(messageService.alert);
    }
  }

})();

