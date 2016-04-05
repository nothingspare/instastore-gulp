'use strict';

var app = angular.module('instastore');

app.controller('ItemStream', [
    '$scope',
    'rest',
    'messageService',
    'UserService',
    '$rootScope',
    function ($scope,
              rest,
              messageService,
              UserService) {

        UserService.initMyStoreSettings();

        rest.path = 'v1/streams';
        rest.models().success(function (data) {
            $scope.items = data;
        }).error(function (e) {
            messageService.alert(e);
            UserService.goToMainStore();
        });
    }]);
