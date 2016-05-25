angular
    .module('instastore')
    .controller('DialogController', DialogController);

DialogController.$inject = ['$mdDialog', 'ModalService', 'SubscriptionService', 'VerifyService', 'TourService',
  'UserService', '$state', 'messageService'];

/* @ngInject */
function DialogController($mdDialog, ModalService, SubscriptionService, VerifyService, TourService, UserService, $state, messageService) {
  var vm = this;

  vm.profile = UserService.getProfile();
  vm.selectedItem = [];

  /* Standart */
  vm.hide = hide;

  /* Welcome */
  vm.buy = buy;
  vm.sell = sell;

  /* Following */
  vm.select = select;
  vm.following = following;

  /* Address and phone */
  vm.address = address;
  vm.sendCodePhone = sendCodePhone;
  vm.VerifyService = VerifyService;

  /* Home screen */

  function hide() {
    $mdDialog.hide();
  }

  function buy() {
    hide();
    SubscriptionService.isFollowing().then(function () {
      ModalService.show('home-screen');
    });
  }

  function sell() {
    VerifyService.showModalAddressPhone().then(function () {
      TourService.addItem();
    });
  }

  function isSelected(store) {
    return _.findIndex(vm.selectedItem, function (storeSelected) {
      return storeSelected.id == store.id;
    });
  }

  function select(store) {
    var index = isSelected(store);
    if (index >= 0) {
      vm.selectedItem.splice(index, 1);
      store.isSelected = false;
    } else {
      vm.selectedItem.push(store);
      store.isSelected = true;
    }
  }

  function following() {
    SubscriptionService.following(vm.selectedItem).success(function (response) {
      if (response) {
        hide();
        $state.go('subscriptions', {}, {reload: true});
      }
    })
  }

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
    if (VerifyService.isVerify()) {
      hide();
      // TourService.addItem();
    }
  }
}