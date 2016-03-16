'use strict';

angular.module('instastore')
    .controller('SubscriptionsMain', [
        '$scope',
        'rest',
        'UserService',
        'errorService',
        function ($scope,
                  rest,
                  UserService,
                  errorService) {
            rest.path = 'v1/subscriptions';
            rest.models().success(function (data) {
                $scope.subs = data;
            }).error(function (e) {
                errorService.alert(e);
                UserService.goToMainStore();
            });
        }]);
