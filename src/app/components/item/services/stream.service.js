(function () {
  'use strict';

  angular
      .module('instastore')
      .factory('StreamService', StreamService);

  StreamService.$inject = ['rest', 'messageService', 'UserService', 'ITEM_STATUS'];

  /* @ngInject */
  function StreamService(rest, messageService, UserService, ITEM_STATUS) {
    var page = 0;
    var pageCount;

    var service = {
      items: [],
      busy: true,
      after: '',
      path: '',
      userId: '',
      nextPage: nextPage,
      all: all,
      init: init
    };
    return service;

    ////////////////

    function nextPage() {
      console.log("next page");
      ++page;
      if (pageCount >= page || page == 1) {
        if (service.busy && page != 1) return;
        service.busy = true;
        getItems();
      }
    }

    function init(path, userId) {
      page = 0;
      service.items = [];
      service.path = path;
      service.userId = userId;
      nextPage();
    }

    function getItems() {
      if (service.path) {
        all(page).then(function (response) {
          pageCount = parseInt(response.headers('X-Pagination-Page-Count'));
          service.items = service.items.concat(response.data);
          service.busy = false;

        });
      }
    }

    function all(page, perPage) {
      var page = page || 1;
      var perPage = perPage || 5;

      rest.path = service.path;

      var params = {
        'per-page': perPage,
        'page': page
      };

      if (service.userId) {
        var addParams = {
          user_id: service.userId,
          status: ITEM_STATUS.active
        };
        params = angular.extend(params, addParams);
      }

      return rest.models(params)
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    }
  }
})();
