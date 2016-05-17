(function () {
  'use strict';

  angular
      .module('instastore')
      .factory('StreamService', StreamService);

  StreamService.$inject = ['rest', 'messageService', 'UserService', 'ITEM_STATUS'];

  /* @ngInject */
  function StreamService(rest, messageService, UserService, ITEM_STATUS) {
    var service = function() {
      this.items = [];
      this.busy = true;
      this.after = '';
      this.path = '';
      this.userId = '';
      this.page = 1;
      this.pageCount = 0;
    };

    ////////////////

    service.prototype.nextPage = function() {
      // console.log("next page");
      if (this.pageCount >= this.page || this.page == 1) {
        if (this.busy && this.page != 1) return;
        this.busy = true;
        this.getItems();
      }
    };

    service.prototype.init = function(path, userId) {
      // this.page = 0;
      // this.items = [];
      this.path = path;
      this.userId = userId;
      this.nextPage();
    };

    service.prototype.getItems = function() {
      if (this.path) {
        this.all(this.page).then(function (response) {
          this.pageCount = parseInt(response.headers('X-Pagination-Page-Count'));
          this.items = this.items.concat(response.data);
          this.busy = false;
          ++this.page;
        }.bind(this));
      }
    };

    service.prototype.all = function(page, perPage) {
      var page = page || 1;
      var perPage = perPage || 5;

      rest.path = this.path;

      var params = {
        'per-page': perPage,
        'page': page
      };

      if (this.userId) {
        var addParams = {
          user_id: this.userId,
          status: ITEM_STATUS.active
        };
        params = angular.extend(params, addParams);
      }

      return rest.models(params)
          .error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
          });
    };

    return service;
  }
})();
