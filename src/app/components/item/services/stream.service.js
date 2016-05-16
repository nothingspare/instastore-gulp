(function () {
  'use strict';

  angular
      .module('instastore')
      .factory('StreamService', StreamService);

  StreamService.$inject = ['rest', 'messageService', 'UserService'];

  /* @ngInject */
  function StreamService(rest, messageService, UserService) {
    var page = 1;
    var pageCount;
    var path = '';

    var service = {
      items : [],
      busy : true,
      after : '',
      path : path,
      nextPage : nextPage,
      all : all,
      init : init
    };
    return service;

    ////////////////

    function nextPage() {
      console.log("next page");
      // if(service.busy) {
        if (pageCount >= page || page == 1) {
          if (service.busy && page != 1) return;
          service.busy = true;
          getItems();
        }
      // }
    }

    function init(path) {
      page = 1;
      service.items = [];
      service.path = path;
      nextPage();
    }

    function getItems() {
      if (service.path) {
        all(page).then(function (response) {
          pageCount = parseInt(response.headers('X-Pagination-Page-Count'));
          service.items = service.items.concat(response.data);
          service.busy = false;
          ++page;
        });
      }
    }

    function all(page, perPage) {
      var page = page || 1;
      var perPage = perPage || 5;

      rest.path = service.path;
      return rest.models({
            'per-page': perPage,
            'page': page
          })
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    }
  }

})();
