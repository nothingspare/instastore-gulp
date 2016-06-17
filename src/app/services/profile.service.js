(function () {
  'use strict';

  angular
      .module('instastore')
      .service('ProfileService', ProfileService);

  ProfileService.$inject = ['$http', 'API_URL', 'messageService'];

  /* @ngInject */
  function ProfileService($http, API_URL, messageService) {
    this.loginInstagram = loginInstagram;

    ////////////////

    function loginInstagram(username, password) {
      return $http.post(API_URL + 'v1/link/instagram-login', {
            username: username,
            password: password
          })
          .error(messageService.alert);
    }
  }

})();

