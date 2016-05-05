(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('ItemGrid', ItemGrid);

  ItemGrid.$inject = [
    '$scope',
    'UserService',
    'StreamService'
  ];

  /* @ngInject */
  function ItemGrid($scope,
                    UserService,
                    StreamService) {

    var vm = this;
    vm.busy = true;
    vm.nextPage = nextPage;

    var page = 1;
    var pageCount;

    activate();

    ////////////////

    function nextPage() {
      ++page;
      if (pageCount >= page) {
        if (this.busy) return;
        vm.busy = true;
        StreamService.all(page).success(function (data) {
          $scope.items = $scope.items.concat(data);
          vm.busy = false;
        });
      }
    }

    function activate() {
      UserService.initMyStoreSettings();
      StreamService.all(page).then(function (data) {
        pageCount = parseInt(data.headers('X-Pagination-Page-Count'));
        $scope.items = data.data;
        vm.busy = false;
      });
    }
  }

})();
