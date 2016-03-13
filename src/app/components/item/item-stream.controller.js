'use strict';

var app = angular.module('instastore');

app.controller('ItemStream', [
    '$scope',
    'rest',
    'errorService',
    'UserService',
    function ($scope,
              rest,
              errorService,
              UserService) {

        $scope.profile = UserService.getProfile();

        rest.path = 'v1/streams';
        rest.models().success(function (data) {
            $scope.items = data;
        }).error(function (e) {
            errorService.alert(e);
            UserService.goToMainStore();
        });
    }]);
