'use strict';

angular.module('instastore')
    .controller('ItemIndex', ['$scope', 'rest', 'UserService', '$stateParams', '$rootScope',
      '$state', 'feedHelper', 'messageService', '$filter', 'ITEM_STATUS', '$auth', 'InAppService', 'StreamService', 'MyStoreFactory',
      function ($scope, rest, UserService, $stateParams, $rootScope,
                $state, feedHelper, messageService, $filter, ITEM_STATUS, $auth, InAppService, StreamService, MyStoreFactory) {

        InAppService.warnIfInApp();

        var vm = this;


        //////////////

        activate();

        function activate() {
          if ($stateParams.storeurl) {
            UserService.initStore();

            if (!UserService.isYourStore()) {
              rest.path = 'v1/stores';
              rest.models({store_url: $stateParams.storeurl}).success(function (data) {
                $scope.store = store = data[0];
                if (!store) {
                  messageService.simpleAlert('nostorewithurl');
                  UserService.goToMainStore();
                  return;
                }
                vm.StreamService = new StreamService();
                vm.StreamService.init('v1/items', store.user_id);
                
                if (UserService.isSeller()) {
                  $scope.showPanel = true;
                }

              }).error(messageService.alert);
            }
            else {
              UserService.initMyStoreSettings();
              vm.StreamService = new StreamService();
              vm.StreamService.init('v1/my-items');
            }
          }
        }

        $scope.$on('newItem', function (event, item) {
          if (item) $scope.items.unshift(item);
          $scope.showPanel = false;
        });

        var store;

        $scope.seemore = function (go) {
          feedHelper.seeMore = true;
          $state.go('itemview', go);
        };

        $scope.leavecomment = function (go) {
          feedHelper.leaveComment = true;
          $state.go('itemview', go);
        };

        $scope.toggleItemStatus = function (item) {
          if (item.status == ITEM_STATUS.inactive) {
            item.status = ITEM_STATUS.active;
          }
          else {
            item.status = ITEM_STATUS.inactive;
          }
          rest.putModel(item).success(function (data) {
            var found = $filter('getById')($scope.items, data.id);
            found.status = data.status;
          }).error(messageService.alert);
        };

        $scope.goToBuyItem = function (storeurl, itemurl) {
          if (UserService.isGuest()) {
            UserService.saveLastRouteToProfile({from: $state.current, fromParams: $stateParams});
            $auth.authenticate('facebook').then(function (res) {
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

              $state.go('itemview', {storeurl: storeurl, itemurl: itemurl, tab: 1});

            }, messageService.satellizerAlert);
          } else {
            $state.go('itemview', {storeurl: storeurl, itemurl: itemurl, tab: 1});
          }
        };

      }])
    .controller('ItemAdd', ['$scope', 'rest', 'ITEM_STATUS', 'API_URL',
      'UserService', 'cfpLoadingBar', '$rootScope', 'PLUPLOAD_RESIZE_CONFIG', '$mdDialog',
      'itemsAmount', 'messageService',
      function ($scope, rest, ITEM_STATUS, API_URL,
                UserService, cfpLoadingBar, $rootScope, PLUPLOAD_RESIZE_CONFIG, $mdDialog,
                itemsAmount, messageService) {
        //TODO: remove hardcoded data
        $scope.item = {category_id: 9, brand_id: 1, description: ''};
        $scope.item.images = [];

        //init Plupload-directive vars
        $scope.plupfiles = [];
        $scope.pluploadConfig = {};
        $scope.pluploadConfig.resize = $scope.pluploadConfig.resize = PLUPLOAD_RESIZE_CONFIG;
        $scope.pluploadConfig.uploadPath = API_URL + 'v1/uploader/item-images?access-token=' + UserService.getToken();

        $scope.save = function () {
          if (!$scope.item.title) $scope.item.title = Math.random().toString(36).slice(2);
          $scope.item.item_url = $scope.item.title;
          $scope.item.status = ITEM_STATUS.active;
          if ($scope.item.id) {
            rest.path = 'v1/user-items';
            rest.putModel($scope.item).success(function (item) {
              messageService.simpleByCode('item', 'saved');
              itemsAmount.incrementItemsAmount();
              $rootScope.$broadcast('newItem', item);
            }).error(messageService.alert);
          } else {
            rest.path = 'v1/user-items';
            rest.postModel($scope.item).success(function (item) {
              messageService.simpleByCode('item', 'saved');
              itemsAmount.incrementItemsAmount();
              $rootScope.$broadcast('newItem', item);
            }).error(messageService.alert);
          }
          $mdDialog.hide();
        };

        //Plupload-directive handlers
        $scope.uploaded = function (data) {
          var res = JSON.parse(data.response);
          $scope.item.id = res.item_id;
          $scope.item.images.push({id: res.id, 'image_url': res.image_url});
          $scope.uploader.setOption('multipart_params', {itemUrl: res.item_url});
          cfpLoadingBar.complete();
          messageService.simpleByCode('item', 'fileUploaded');
        };

        $scope.added = function () {
          cfpLoadingBar.start();
        };

        $scope.progress = function () {
          cfpLoadingBar.set($scope.percent);
        };

        $scope.closeDialog = function () {
          $mdDialog.hide();
        };
      }
    ])
    .controller('ItemViewTabsCtrl', ['$scope', '$rootScope', '$timeout', '$stateParams', 'UserService',
      '$auth', 'messageService', '$state', '$location', 'rest',
      function ($scope, $rootScope, $timeout, $stateParams, UserService, $auth, messageService, $state, $location,
                rest) {

        $scope.onClickTab = function (tab) {
          if (UserService.isGuest() && tab.index == 2) {
            UserService.saveLastRouteToProfile({from: $state.current, fromParams: $stateParams});
            $auth.authenticate('facebook').then(function (res) {
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

              $scope.changeStateAndUrlToTab(tab);

            }, messageService.satellizerAlert);
          }
          else {
            $scope.changeStateAndUrlToTab(tab);
          }
        };

        $scope.changeStateAndUrlToTab = function (tab) {
          //$stateParams['tab'] = tab;
          //$state.params['tab'] = tab;
          $location.url($stateParams.storeurl + '/' + $stateParams.itemurl + '/' + tab);
        };

        $scope.isActiveTab = function (tabUrl) {
          UserService.init();
          return tabUrl == $scope.currentTab;
        };

        $scope.toggleItemLike = function () {
          if (!$scope.item.myLike) {
            $rootScope.showHearts = true;
            $timeout(function () {
              $rootScope.showHearts = false;
            }, 1000);
            rest.path = 'v1/my-likes';
            rest.postModel({item_id: $scope.item.id}).success(function (like) {
              $scope.item.myLike = like;
              $scope.item.likesAmount++;
            }).error(messageService.simpleAlert);
            $scope.item.myLike = {};
          } else {
            rest.path = 'v1/my-likes/' + $scope.item.myLike.id;
            rest.deleteModel().success(function () {
              delete($scope.item.myLike);
              $scope.item.likesAmount--;
            }).error(messageService.simpleAlert);
          }
        };

        if ($rootScope.isSeller)
          switch ($stateParams.tab) {
            case '1':
              $scope.currentTab = 'app/components/item/view-tab-comment.html';
              break;
            case '2':
              $scope.currentTab = 'app/components/item/view-tab-log.html';
              break;
            case '3':
              $scope.currentTab = 'app/components/item/view-tab-social.html';
              break;
            case '4':
              $scope.currentTab = 'app/components/item/view-tab-edit.html';
              break;
            default:
              $scope.currentTab = 'app/components/item/view-tab-comment.html';
          }
        else
          switch ($stateParams.tab) {
            case '1':
              $scope.currentTab = 'app/components/item/view-tab-comment.html';
              break;
            case '2':
              if (UserService.isGuest()) {
                UserService.saveLastRouteToProfile({from: $state.current, fromParams: $stateParams});
                $auth.authenticate('facebook').then(function (res) {
                  if (UserService.isGuest()) {
                    UserService.login(res.data.token);
                    if (UserService.getProfile().lastRoute) {
                      var lastRoute = UserService.getProfile().lastRoute;
                    }
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
                    $scope.currentTab = 'app/components/item/view-tab-buy.html';
                  }
                }, messageService.satellizerAlert);
              }
              else {
                $scope.currentTab = 'app/components/item/view-tab-buy.html';
              }
              break;
            case '3':
              $scope.currentTab = 'app/components/item/view-tab-comment.html';
              $scope.likeItem();
              break;
            case '4':
              $scope.currentTab = 'app/components/item/view-tab-location.html';
              break;
            default:
              $scope.currentTab = 'app/components/item/view-tab-comment.html';
          }
      }])
    .controller('ItemLocation', ['$scope', 'UserService', 'uiGmapGoogleMapApi', function ($scope, UserService, uiGmapGoogleMapApi) {
      uiGmapGoogleMapApi
          .then(function () {
            $scope.renderMap = true;
            var profile = UserService.getProfile();
            if (profile) {
              $scope.map = {
                center: {latitude: profile.store.store_long, longitude: profile.store.store_lat},
                zoom: 14
              };
              $scope.staticMarker = {id: 'store-marker1'};
              $scope.staticMarker.coords = {
                latitude: profile.store.store_long,
                longitude: profile.store.store_lat
              };
            }
            return uiGmapGoogleMapApi;
          });
    }])
    .controller('InstagramImport', ['$scope', '$http', 'API_URL', 'messageService', 'UserService',
      'itemsAmount', '$mdDialog', '$mdMedia', 'rest',
      function ($scope, $http, API_URL, messageService, UserService, itemsAmount,
                $mdDialog, $mdMedia, rest) {

        $scope.loadInstagramItems = function (maxId) {
          var source = 'v1/link/instagram-media';
          if (maxId) {
            source = source + '?' + rest.serialize({'max_id': maxId});
          }
          $http.get(API_URL + source).success(function (data) {
            if ($scope.items) {
              $scope.items = $scope.items.concat(data);
            } else {
              $scope.items = data;
            }
          }).error(messageService.alert);
        };

        $scope.loadInstagramItems();

        $scope.importItems = function () {
          var items = [];
          angular.forEach($scope.items, function (value) {
            if (value.isChecked === true) {
              var item = {
                description: value.caption ? value.caption.text : 'Item from Instagram',
                image_url: value.images.standard_resolution.url
              };
              items.push(item);
            }
          });
          $http.post(API_URL + 'v1/uploader/item-import', items).success(function () {
            itemsAmount.addItemsAmount(items.length);
            $mdDialog.show({
              controller: 'ProfileIndex',
              templateUrl: 'app/components/profile/profile.html',
              parent: angular.element(document.body),
              clickOutsideToClose: true,
              fullscreen: $mdMedia('xs')
            });
            UserService.goToMainStore();

          }).error(messageService.alert);
        };

        $scope.checkAll = function () {
          angular.forEach($scope.items, function (value) {
            value.isChecked = true;
          });
        };

        $scope.uncheckAll = function () {
          angular.forEach($scope.items, function (value) {
            value.isChecked = false;
          });
        };

      }])
    .controller('PaymentCtrl', ['$scope', function ($scope) {

    }]);
