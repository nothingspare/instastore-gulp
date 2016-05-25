(function () {
  'use strict';

  angular
      .module('instastore')
      .directive('storeItemSheet', storeItemSheet);

  storeItemSheet.$inject = ['$mdDialog', 'ItemService', '$mdMedia', '$state'];

  /* @ngInject */
  function storeItemSheet($mdDialog, ItemService, $mdMedia, $state) {
    var directive = {
      link: link,
      restrict: 'A',
      scope: {
        store: '=storeModel'
      }
    };
    return directive;

    function link(scope, element, attrs) {
      element.bind('click', function () {
        ItemService.all(scope.store.user_id)
            .success(function (items) {
              if (!items.length) {
                $state.go('grid', {storeurl: scope.store.store_url, mode: 'feed'});
                return;
              }
              scope.items = items;
              showItems();
            });
      });

      function showItems() {
        var useFullScreen = $mdMedia('xs');
        $mdDialog.show({
          templateUrl: 'app/components/subscriptions/directive/store-items-sheet.html',
          parent: angular.element(document.body),
          scope: scope,
          preserveScope: true,
          clickOutsideToClose: true,
          controller: 'DialogController',
          controllerAs: 'vm',
          fullscreen: useFullScreen
        });
      }
    }
  }
})();

