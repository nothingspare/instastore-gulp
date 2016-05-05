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

    var service = function(path) {
      this.items = [];
      this.busy = true;
      this.after = '';
      this.nextPage = nextPage;
      this.all = all;
      path = path;
      this.activate = activate;
    };
    return service;

    ////////////////

    function nextPage() {
      console.log("next page");
      ++page;
      if (pageCount >= page || page == 1) {
        if (this.busy && page != 1) return;
        service.busy = true;
        getItems();
      }
    }
    
    function activate() {
      getItems();
    }

    function getItems() {
      all(page).then(function (response) {
        pageCount = parseInt(response.headers('X-Pagination-Page-Count'));
        service.items = service.items.concat(response.data);
        service.busy = false;
      });
    }

    function all(page, perPage) {
      var page = page || 1;
      var perPage = perPage || 5;

      rest.path = path;
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
