(function () {
  'use strict';

  angular
      .module('instastore')
      .controller('ItemView', ItemView);

  ItemView.$inject = ['$scope', 'rest', '$state', 'feedHelper',
    'UserService', '$stateParams', '$location', '$anchorScroll', '$timeout', 'API_URL', 'cfpLoadingBar',
    'CLIENT_URL', 'PLUPLOAD_RESIZE_CONFIG', 'ITEMSELLTRANSACTION_STATUS', '$filter', '$http', '$window',
    'uiGmapGoogleMapApi', '$auth', '$mdDialog', '$mdMedia', 'itemsAmount', 'InAppService', 'messageService',
    'urlsThere', 'VerifyService', '$rootScope', '$cookies'];

  /* @ngInject */
  function ItemView($scope, rest, $state, feedHelper, UserService, $stateParams,
                    $location, $anchorScroll, $timeout, API_URL, cfpLoadingBar, CLIENT_URL, PLUPLOAD_RESIZE_CONFIG,
                    ITEMSELLTRANSACTION_STATUS, $filter, $http, $window, uiGmapGoogleMapApi, $auth, $mdDialog, $mdMedia,
                    itemsAmount, InAppService, messageService, urlsThere, VerifyService, $rootScope, $cookies) {
    var vm = this;

    $scope.VerifyService = VerifyService;
    $scope.seeMore = false;
    $scope.profile = UserService.getProfile();
    $scope.isFacebookInApp = InAppService.isFacebookInApp();
    $scope.isGuest = UserService.isGuest();
    $scope.isYourStore = $scope.isSeller = UserService.isYourStore();
    $scope.transactionStates = ITEMSELLTRANSACTION_STATUS;
    //init Plupload-directive vars
    $scope.plupfiles = [];
    $scope.pluploadConfig = {};
    $scope.pluploadConfig.uploadPath = API_URL + 'v1/uploader/item-images?access-token=' + UserService.getToken();
    $scope.pluploadConfig.resize = PLUPLOAD_RESIZE_CONFIG;
    $scope.pluploadConfig.multiParams = {itemUrl: $stateParams.itemurl};
    //for form in view view-tab-social
    $scope.post = {};
    $scope.form = {};

    // save last item to cookies
    $scope.$watch('$stateParams.tab', function (tab, oldTab) {
      if(tab === oldTab){
        return
      }
      $cookies.lastItem = JSON.stringify({
        storeurl: $stateParams.storeurl,
        itemurl: $stateParams.itemurl,
        tab: $stateParams.tab
      });
    });

    activate();

    ////////////////
    function activate() {
      if (!$scope.item) {
        $scope.item = {};
        if (!UserService.isGuest()) {
          rest.path = 'v1/user-items';
        }
        else {
          rest.path = 'v1/items';
        }
        if ($stateParams.itemurl) {
          $scope.itemUrl = CLIENT_URL + $stateParams.storeurl + '/' + $stateParams.itemurl;

          //rest.path is above
          rest.models({item_url: $stateParams.itemurl}).success(function (data) {
            $scope.item = data[0];
            checkCity();
          }).error(messageService.alert);
        }
        else {
          messageService.simpleAlert('noitemwithurl');
          UserService.goToMainStore();
        }
      }

      uiGmapGoogleMapApi
          .then(function () {
            return uiGmapGoogleMapApi;
          })
          .then(function () {
            $scope.renderMap = true;
          });

      if (!urlsThere) {
        messageService.simpleByCode('item', 'urlWrongFormat');
        UserService.goToMainStore();
      }

      $scope.seeMore = false;
      if (feedHelper.seeMore) {
        $scope.seeMore = true;
        feedHelper.seeMore = false;
      }

      $scope.leaveComment = false;
      if (feedHelper.leaveComment) {
        $scope.leaveComment = true;
        feedHelper.leaveComment = false;
      }
    }

    function checkCity() {
      if ($scope.item.user.store.address) {
        var regexp = /(^\s)?(\w\s?)+\s?,/g;
        var city = $scope.item.user.store.address.match(regexp)[2].replace(',', '');

        if (/\d+/.test(city)) {
          $scope.city = $scope.item.user.store.address.match(regexp)[1].replace(',', '');
        } else {
          $scope.city = city;
        }
      }
    }

    $scope.saveInstagramEnabled = function () {
      if ($scope.profile.hasInstagramCredentials) {
        $scope.save();
      } else {
        if ($scope.item.instagram_sharing_enabled) {
          $location.hash('start');
          showDialogLoginInstagram();
        }
      }
    };

    function loginInstagram() {
      $scope.item.instagram_sharing_enabled = false;
      return $http.post(API_URL + 'v1/link/instagram-login', {
            username: $scope.igUsername,
            password: $scope.igPassword
          })
          .success(function (res) {
            if (res) {
              $mdDialog.hide();
              $scope.profile.hasInstagramCredentials = true;
              $scope.item.instagram_sharing_enabled = true;
              $scope.save();
              UserService.setProfile($scope.profile);
            }
          })
          .error(messageService.alert);
    }

    $scope.loginInstagram = function () {
      loginInstagram();
    };

    function authToPinterest() {
      $auth.link('pinterest').then(function (res) {
        if (res) {
          $scope.profile.hasPinterestToken = true;
          $scope.item.pinterest_sharing_enabled = true;
          $scope.save();
          UserService.setProfile($scope.profile);
        }
      });
    }

    $scope.savePinterestEnabled = function () {
      if ($scope.profile.hasPinterestToken) {
        $scope.save();
      } else {
        if ($scope.item.pinterest_sharing_enabled) {
          authToPinterest();
        }
      }
    };

    $scope.initPinterest = function () {
      $scope.item.pinterest_sharing_enabled = false;
      $http.post(API_URL + 'v1/link/init-pinterest', {
        token: $scope.pinToken
      }).success(function (res) {
        if (res) {
          $mdDialog.hide();
          $scope.profile.hasPinterestToken = true;
          $scope.item.pinterest_sharing_enabled = true;
          $scope.save();
          UserService.setProfile($scope.profile);
        }
      }).error(messageService.alert);
    };

    $scope.postSocial = function () {
      if ($scope.item.instagram_sharing_enabled || $scope.item.pinterest_sharing_enabled || $scope.item.facebook_sharing_enabled) {
        $http.post(API_URL + 'v1/link/social-export', {
          item_id: $scope.item.id,
          post: $scope.post.content
        }).success(function () {
          messageService.simpleByCode('item', 'successPosted');
          $scope.post.content = '';
          $timeout(function () {
            //TODO::remove it. Terrible solving md-input issue in that way8)))) https://github.com/angular/material/issues/1983
            document.getElementsByClassName("md-char-counter")[1].innerHTML = '0/256';
          }, 300);
        }).error(function (res) {
          messageService.alert(res);
          var state = $state;
          if (res.code == 190) {
            $auth.authenticate('facebook').then(function () {
              $state.go(state.current.name, state.params);
            });
          } else if (res.code == 195) {
            showDialogLoginInstagram();
          } else if (res.code == 196) {
            authToPinterest();
          }
        });
      }
    };

    function showDialogLoginInstagram() {
      $mdDialog.show({
        templateUrl: 'app/components/item/login-instagram.html',
        parent: angular.element(document.body),
        scope: $scope,
        preserveScope: true,
        clickOutsideToClose: true,
        fullscreen: $mdMedia('xs')
      });
    }

    $scope.save = function () {
      $scope.item.item_url = $scope.item.title;
      rest.path = 'v1/user-items';
      rest.putModel($scope.item).success(function (item) {
        $scope.item = item;
        messageService.simpleByCode('item', 'saved');
        if ($stateParams.tab === '4') {
          $state.transitionTo('itemview', {
            storeurl: $stateParams.storeurl,
            itemurl: item.item_url,
            tab: $stateParams.tab
          });
        }
      }).error(messageService.alert);
    };

    $scope.removeImage = function (thumb) {
      var index = $scope.item.images.indexOf(thumb);
      $scope.item.images.splice(index, 1);
      rest.path = 'v1/item-images/' + thumb.id;
      rest.deleteModel()
          .success(function () {
            messageService.simpleByCode('item', 'imageDeleted!');
          }).error(messageService.alert);
    };

    $scope.removeItem = function () {
      if ($scope.item.images) {
        var index;
        for (index = 0; index < $scope.item.images.length; ++index) {
          $scope.removeImage($scope.item.images[index]);
        }
      }
      rest.path = 'v1/user-items/' + $scope.item.id;
      rest.deleteModel()
          .success(function () {
            itemsAmount.decrementItemsAmount();
            messageService.simpleByCode('item', 'itemDeleted');
            UserService.goToMainStore();
          })
          .error(messageService.alert);
    };

    $scope.saveComment = function (comment) {
      if(UserService.isGuest()) {
        $state.go('login');
        return;
      }
      //$scope.form = {};
      $scope.item.newComment = '';
      $scope.form.postForm.$setPristine();
      $scope.form.postForm.$setUntouched();
      $scope.seeMore = true;
      rest.path = 'v1/comments';
      rest.postModel({content: comment, item_id: $scope.item.id}).success(function () {
        messageService.simpleByCode('item', 'commented');
        $scope.item.comments.push({
          authorFullName: UserService.getUserFullName(),
          content: comment,
          authorFacebookAvatar: $scope.profile.avatar_url
        });
      }).error(messageService.alert);
    };

    $scope.showCommentTab = function () {
      $scope.leaveComment = !$scope.leaveComment;
      $scope.goToBottom();
    };

    $scope.goToBottom = function () {
      $timeout(function () {
        $location.hash('bottom');
        $anchorScroll();
      }, 450);
    };

    //Plupload-directive handlers
    $scope.uploaded = function (data) {
      var res = JSON.parse(data.response);
      $scope.item.images.push({id: res.id, 'image_url': res.image_url});
      cfpLoadingBar.complete();
      messageService.simpleByCode('item', 'fileUploaded');
    };

    $scope.added = function () {
      cfpLoadingBar.start();
    };

    $scope.progress = function () {
      cfpLoadingBar.set($scope.percent);
    };

    $scope.buyItem = function (cardNumber, cardExpiry, cardCcv) {
      rest.path = 'v1/item-sells';
      //TODO: remove hardcoded quantity when we can use it
      rest.postModel({
        item_id: $scope.item.id,
        quantity: 1,
        cardNumber: cardNumber,
        cardExpiryMonth: cardExpiry.month,
        cardExpiryYear: cardExpiry.year,
        cardCcv: cardCcv
      }).success(function (itemsell) {
        if (!$scope.item.itemSells) {
          $scope.item.itemSells = [];
        }
        $scope.item.itemSells.unshift(itemsell);
        messageService.simpleByCode('item', 'success');
        $scope.showConfirm = false;
      }).error(messageService.exception);
    };

    $scope.changeItemStatus = function (itemId, status, box) {
      rest.path = 'v1/item-sell-transactions';
      var req = {
        itemsell_id: itemId,
        status: status
      };
      if (status === ITEMSELLTRANSACTION_STATUS.send && box) {
        req.box = box * 1;
      }
      rest.postModel(req).success(function (transaction) {
        var found = $filter('getById')($scope.item.itemSells, itemId);
        if (found) {
          found.itemSellTransactions.push(transaction);
        }
        else {
          $scope.item.itemSells[0].itemSellTransactions.push(transaction)
        }
      }).error(messageService.alert);
    };

    $scope.toggle = function (scope) {
      scope.toggle();
    };

    $scope.confirmBuying = function () {
      if (!VerifyService.isVerify()) {
        VerifyService.showModalAddressPhone()
            .then(function () {
              $scope.showConfirm = true;
            })
            .catch(function (err) {
              $scope.showConfirm = false;
            });
      } else {
        $scope.showConfirm = true;
        $timeout(function () {
          if ($stateParams !== '0') {
            $location.url($stateParams.storeurl + '/' + $stateParams.itemurl + '/0#form-end');
          }
        }, 450);
      }
    };

    $scope.getLabel = function (isell, ev) {
      $location.hash('start');
      $scope.isellBox = isell.box;
      $http.post(API_URL + 'v1/link/label', {
        buyerId: isell.buyer.id,
        itemId: $scope.item.id,
        itemSellId: isell.id
      }).success(function (label) {
        if (label.label) {
          var found = $filter('getById')($scope.item.itemSells, isell.id);
          found.itemSellTransactions.push({status: 30});
        }
        $scope.label = label;
        $mdDialog.show({
          templateUrl: 'app/components/item/label.html',
          parent: angular.element(document.body),
          scope: $scope,
          preserveScope: true,
          clickOutsideToClose: true,
          fullscreen: $mdMedia('xs')
        });
      }).error(messageService.alert);
    };

    $scope.closeDialog = function () {
      $mdDialog.hide();
    };

    $scope.printLabel = function () {
      $window.print();
    };

    $scope.emailLabel = function (isellId) {
      $http.post(API_URL + 'v1/link/label-send', {isellId: isellId}).success(function (res) {
        if (res) {
          messageService.simpleByCode('item', 'labelSent');
        }
      }).error(messageService.alert);
    };

    $scope.goToStoreProfile = function (storeUrl) {
      UserService.goToStoreProfile(storeUrl);
    };

    $scope.login = function () {
      if (UserService.isGuest()) {
        UserService.saveLastRouteToProfile({from: $state.current, fromParams: $stateParams});
        $auth.authenticate('facebook').then(function (res) {
          //prevent multiple running
          if (UserService.isGuest()) {
            if (UserService.getProfile().lastRoute) {
              var lastRoute = UserService.getProfile().lastRoute;
            }
            UserService.login(res.data.token);
            UserService.setFacebookProfile(res.data.facebookProfile);
            res.data.profile.stores = res.data.stores;
            if (res.data.store) {
              res.data.profile.store = res.data.store;
              UserService.setBg(res.data.store.bg_url);
              UserService.setAvatar(res.data.store.avatar_url);
            }
            res.data.profile.lastRoute = lastRoute;
            UserService.setProfile(res.data.profile);
            $scope.profile = res.data.profile;
            if ($state.includes('itemview')) {
              $state.go('itemview')
            }
          }
        });
      }
    };

    $scope.duplicateItem = function () {
      rest.path = 'v1/user-items';
      var newItem = $scope.item;
      delete(newItem.id);
      rest.postModel(newItem).success(function (item) {
        messageService.simpleByCode('item', 'duplicated');
      }).error(messageService.alert);
    };
  }
})();

