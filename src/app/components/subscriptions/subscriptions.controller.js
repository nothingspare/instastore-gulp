(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('SubscriptionsMain', SubscriptionsMain);

  SubscriptionsMain.$inject = ['UserService', 'SubscriptionService'];

  /* @ngInject */
  function SubscriptionsMain(UserService, SubscriptionService) {
    var vm = this;

    vm.searchText = '';
    vm.following = following;
    vm.querySearch = querySearch;

    activate();

    ////////////////

    function activate() {
      UserService.initMyStoreSettings();

      SubscriptionService.all()
          .success(function (data) {
            vm.subs = data;
          })
          .then(function () {
            SubscriptionService.recommended()
                .success(function (data) {
                  vm.subsRecommended = data;
                })
          });
    }

    function following(name) {
      console.log(name);
    }

    function querySearch (query) {
      // var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
      //     deferred;
      // if (self.simulateQuery) {
      //   deferred = $q.defer();
      //   $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
      //   return deferred.promise;
      // } else {
      //   return results;
      // }
    }
  }

})();
