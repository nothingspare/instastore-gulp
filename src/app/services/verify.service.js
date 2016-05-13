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
        controller: 'DialogController3 as vm',
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

  angular
      .module('instastore')
      .controller('DialogController3', DialogController);

  DialogController.$inject = ['$mdDialog', 'VerifyService', 'messageService', 'UserService', 'TourService'];

  /* @ngInject */
  function DialogController($mdDialog, VerifyService, messageService, UserService, TourService) {
    var vm = this;

    vm.profile = UserService.getProfile();

    vm.hide = hide;
    vm.address = address;
    vm.sendCodePhone = sendCodePhone;
    vm.VerifyService = VerifyService;

    function address() {
      VerifyService.address(vm.profile)
          .success(function (data) {
            if (data.AddressValidateResponse.Address) {
              messageService.simpleByCode('profile', 'addressSuccess');

              vm.profile.apartment = data.AddressValidateResponse.Address.Address1;
              vm.profile.address = data.AddressValidateResponse.Address.Address2;
              vm.profile.state = data.AddressValidateResponse.Address.State;
              vm.profile.city = data.AddressValidateResponse.Address.City;
              vm.profile.zipcode = data.AddressValidateResponse.Address.Zip5;
              vm.profile.address_verified_at = Math.floor(Date.now() / 1000);
              UserService.setProfile(vm.profile);
              checkIsVerify();
            }
            else {
              messageService.simpleByCode('profile', 'addressError');
            }
          });
    }

     function sendCodePhone(code) {
      VerifyService.sendCode(code)
          .success(function (res) {
            vm.profile.phone = res.phone;
            vm.profile.phone_validated_at = res.phone_validated_at;
            UserService.setProfile(vm.profile);
            messageService.simpleByCode('verify', 'success');
            checkIsVerify();
          });
    };

    function checkIsVerify() {
      if(VerifyService.isVerify()) {
        hide();
        // TourService.addItem();
      }
    }

    function hide() {
      $mdDialog.hide();
    }
  }
})();

