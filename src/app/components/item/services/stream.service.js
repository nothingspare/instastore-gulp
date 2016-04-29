(function () {
  'use strict';

  angular
      .module('instastore')
      .service('StreamService', StreamService);

  StreamService.$inject = ['rest', 'messageService', 'UserService'];

  /* @ngInject */
  function StreamService(rest, messageService, UserService) {
    var service = {
      all: all
    };
    return service;

    ////////////////

    function all(page, perPage) {
      var page = page || 1;
      var perPage = perPage || 5;

      rest.path = 'v1/streams';
      return rest.models({
            'per-page': perPage,
            'page': page
          })
          .success(function (data) {
          })
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    }
  }

})();

