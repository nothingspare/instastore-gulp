'use strict';

angular.module('instastore')
    .controller('SubscriptionsMain', [
        '$scope',
        'rest',
        'UserService',
        'messageService',
        function ($scope,
                  rest,
                  UserService,
                  messageService) {

            UserService.initMyStoreSettings();

            rest.path = 'v1/subscriptions';
            rest.models().success(function (data) {
                $scope.subs = data;
            }).error(function (e) {
                messageService.alert(e);
                UserService.goToMainStore();
            });
        }]);
