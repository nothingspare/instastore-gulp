(function () {
  'use strict';

  angular
      .module('instastore')
      .directive('searchStore', searchStore);

  searchStore.$inject = [];

  /* @ngInject */
  function searchStore() {
    var directive = {
      bindToController: true,
      controller: SearchStoreCtrl,
      templateUrl: 'app/components/store/directive/search.html',
      controllerAs: 'vm',
      link: link,
      restrict: 'E',
      transclude: false,
      scope: {
        placeholder: '@'
      }
    };
    return directive;

    function link(scope, element, attrs) {
    }
  }

  SearchStoreCtrl.$inject = ['StoreService', '$state'];

  /* @ngInject */
  function SearchStoreCtrl(StoreService, $state) {
    var vm = this;

    vm.searchText = '';
    vm.selectedStore;

    vm.querySearch = querySearch;
    vm.change = change;

    function querySearch(text) {
      return StoreService.search(text)
          .then(function (data) {
            return data;
          });
    }

    function change() {
      vm.searchText = '';
      $state.go('grid', {
        storeurl: vm.selectedStore.store_url,
        mode: 'feed'
      })
    }
  }

})();

