'use strict';

angular.module('instastore')
    .service('itemsAmount', ['UserService', '$rootScope', function (UserService, $rootScope) {
        var profile;
        return {
            initProfile: function () {
                profile = UserService.getProfile();
            },
            incrementItemsAmount: function () {
                this.initProfile();
                profile.store.userItemsAmount++;
                $rootScope.store.userItemsAmount = profile.store.userItemsAmount;
                UserService.setProfile(profile);
            },
            decrementItemsAmount: function () {
                this.initProfile();
                profile.store.userItemsAmount--;
                $rootScope.store.userItemsAmount = profile.store.userItemsAmount;
                UserService.setProfile(profile);
            },
            addItemsAmount: function (add) {
                this.initProfile();
                profile.store.userItemsAmount = $rootScope.store.userItemsAmount = profile.store.userItemsAmount * 1 + add;
                UserService.setProfile(profile);
            }

        }
    }]);
