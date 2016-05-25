(function () {
  'use strict';

  angular
      .module('instastore')
      .service('VerifyService', VerifyService);

  VerifyService.$inject = ['rest', 'messageService', 'UserService', '$mdDialog', '$mdMedia', '$q'];

  /* @ngInject */
  function VerifyService(rest, messageService, UserService, $mdDialog, $mdMedia, $q) {
    this.phone = phone;
    this.address = address;
    this.sendCode = sendCode;
    this.isVerify = isVerify;
    this.showModalAddressPhone = showModalAddressPhone;

    ////////////////

    function phone(phoneNumber) {
      rest.path = 'v1/link/verify-phone';
      var params = {
        phone: phoneNumber
      };
      if (phoneNumber.substring(0, 4) === '+380') {
        params.country = 'UA';
      }
      return rest.models(params)
          .error(messageService.profile);
    }

    function address(profile) {
      rest.path = 'v1/link/verify-address';
      return rest.postModel({
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zipcode: profile.zipcode,
            apartment: profile.apartment
          })
          .error(messageService.profile);
    }

    function sendCode(code) {
      rest.path = 'v1/link/confirm-phone';
      return rest.models({code: code})
          .error(messageService.profile);
    }

    function isVerify() {
      var profile = UserService.getProfile();
      return (profile.address
          && profile.city
          && profile.state
          && profile.zipcode)
          && profile.phone;
    }

    function showModalAddressPhone() {
      var deferred = $q.defer();
      $mdDialog.show({
        controller: 'DialogController as vm',
        templateUrl: 'app/components/item/profile-verify.html',
        parent: angular.element(document.body),
        // scope: $scope,
        preserveScope: true,
        clickOutsideToClose: true,
        fullscreen: $mdMedia('xs'),
        onRemoving: function () {
          isVerify() ? deferred.resolve() : deferred.reject(err);
        }
      });

      return deferred.promise;
    }
  }

})();

