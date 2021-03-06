'use strict';

angular.module('instastore')
    .controller('ItemIndex', ['$scope', 'rest', 'toaster', 'UserService', '$stateParams', '$rootScope',
        '$state', 'feedHelper', 'errorService', '$filter', 'ITEM_STATUS', '$auth', 'InAppService',
        function ($scope, rest, toaster, UserService, $stateParams, $rootScope,
                  $state, feedHelper, errorService, $filter, ITEM_STATUS, $auth, InAppService) {

            InAppService.warnIfInApp();

            $scope.$on('newItem', function (event, item) {
                if (item) $scope.items.unshift(item);
                $scope.showPanel = false;
            });


            var store;
            if ($stateParams.storeurl) {
                if (!UserService.isYourStore()) {
                    rest.path = 'v1/stores';
                    rest.models({store_url: $stateParams.storeurl}).success(function (data) {
                        $scope.store = store = data[0];
                        if (!store) {
                            errorService.simpleAlert('nostorewithurl');
                            $state.go('grid');
                            return;
                        }
                        rest.path = 'v1/items';
                        rest.models({user_id: store.user_id, status: ITEM_STATUS.active}).success(function (data) {
                            if (data.length === 0 && UserService.isSeller()) $scope.showPanel = true;
                            $scope.items = data;
                        });
                    }).error(errorService.simpleAlert);
                }
                else {
                    UserService.initMyStoreSettings();
                    rest.path = 'v1/my-items';
                    rest.models().success(function (data) {
                        if (data.length === 0 && UserService.isSeller()) $scope.showPanel = true;
                        $scope.items = data;
                    }).error(errorService.simpleAlert);
                }
            }

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
                }).error(errorService.alert);
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

                    }, errorService.satellizerAlert);
                } else {
                    $state.go('itemview', {storeurl: storeurl, itemurl: itemurl, tab: 1});
                }
            };

        }])
    .controller('ItemView', ['$scope', 'rest', 'toaster', '$state', 'feedHelper', 'errorService',
        'UserService', '$stateParams', '$location', '$anchorScroll', '$timeout', 'API_URL', 'cfpLoadingBar',
        'CLIENT_URL', 'PLUPLOAD_RESIZE_CONFIG', 'ITEMSELLTRANSACTION_STATUS', '$filter', '$http', '$window',
        'uiGmapGoogleMapApi', '$auth', '$mdDialog', '$mdMedia', 'itemsAmount', 'InAppService',
        function ($scope, rest, toaster, $state, feedHelper, errorService, UserService, $stateParams,
                  $location, $anchorScroll, $timeout, API_URL, cfpLoadingBar, CLIENT_URL, PLUPLOAD_RESIZE_CONFIG,
                  ITEMSELLTRANSACTION_STATUS, $filter, $http, $window, uiGmapGoogleMapApi, $auth, $mdDialog, $mdMedia,
                  itemsAmount, InAppService) {

            $scope.isFacebookInApp = InAppService.isFacebookInApp();
            $scope.warnIfInApp = function () {
                InAppService.warnIfInApp();
            };

            $scope.seeMore = false;

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
                    }).error(errorService.alert);
                }
                else {
                    errorService.simpleAlert('noitemwithurl');
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

            $scope.profile = UserService.getProfile();

            $scope.isGuest = UserService.isGuest();
            $scope.isYourStore = UserService.isYourStore();
            $scope.isSeller = $scope.profile.seller;

            $scope.transactionStates = ITEMSELLTRANSACTION_STATUS;

            //init Plupload-directive vars
            $scope.plupfiles = [];
            $scope.pluploadConfig = {};
            $scope.pluploadConfig.uploadPath = API_URL + 'v1/uploader/item-images?access-token=' + UserService.getToken();
            $scope.pluploadConfig.resize = PLUPLOAD_RESIZE_CONFIG;
            $scope.pluploadConfig.multiParams = {itemUrl: $stateParams.itemurl};


            $scope.saveInstagramEnabled = function () {
                if ($scope.profile.hasInstagramCredentials) {
                    $scope.save();
                } else {
                    if ($scope.item.instagram_sharing_enabled) {
                        $location.hash('start');
                        $mdDialog.show({
                            templateUrl: 'app/components/item/login-instagram.html',
                            parent: angular.element(document.body),
                            scope: $scope,
                            preserveScope: true,
                            clickOutsideToClose: true,
                            fullscreen: $mdMedia('xs')
                        });
                    }
                }
            };

            $scope.loginInstagram = function () {
                $scope.item.instagram_sharing_enabled = false;
                $http.post(API_URL + 'v1/link/instagram-login', {
                    username: $scope.igUsername,
                    password: $scope.igPassword
                }).success(function (res) {
                    if (res) {
                        $mdDialog.hide();
                        $scope.profile.hasInstagramCredentials = true;
                        $scope.item.instagram_sharing_enabled = true;
                        $scope.save();
                        UserService.setProfile($scope.profile);
                    }
                }).error(errorService.alert);
            };

            $scope.savePinterestEnabled = function () {
                if ($scope.profile.hasPinterestToken) {
                    $scope.save();
                } else {
                    if ($scope.item.pinterest_sharing_enabled) {
                        $auth.link('pinterest').then(function (res) {
                            if (res) {
                                $scope.profile.hasPinterestToken = true;
                                $scope.item.pinterest_sharing_enabled = true;
                                $scope.save();
                                UserService.setProfile($scope.profile);
                            }
                        });
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
                }).error(errorService.alert);
            };

            //for form in view view-tab-social
            $scope.post = {};

            $scope.postSocial = function () {
                if ($scope.item.instagram_sharing_enabled || $scope.item.pinterest_sharing_enabled || $scope.item.facebook_sharing_enabled) {
                    $http.post(API_URL + 'v1/link/social-export', {
                        item_id: $scope.item.id,
                        post: $scope.post.content
                    }).success(function () {
                        toaster.pop('success', 'Successfully posted');
                        $scope.post.content = '';
                        $timeout(function () {
                            //TODO::remove it. Terrible solving md-input issue in that way8)))) https://github.com/angular/material/issues/1983
                            document.getElementsByClassName("md-char-counter")[1].innerHTML = '0/256';
                        }, 300);
                    }).error(errorService.alert);
                }
            };

            $scope.save = function () {
                $scope.item.item_url = $scope.item.title;
                rest.path = 'v1/user-items';
                rest.putModel($scope.item).success(function (item) {
                    $scope.item = item;
                    toaster.pop('success', 'Saved');
                    if ($stateParams.tab === '4') {
                        $state.transitionTo('itemview', {
                            storeurl: $stateParams.storeurl,
                            itemurl: item.item_url,
                            tab: $stateParams.tab
                        });
                    }
                }).error(errorService.alert);
            };

            $scope.removeImage = function (thumb) {
                var index = $scope.item.images.indexOf(thumb);
                $scope.item.images.splice(index, 1);
                rest.path = 'v1/item-images/' + thumb.id;
                rest.deleteModel()
                    .success(function () {
                        toaster.pop('success', "Image deleted!");
                    }).error(errorService.alert);
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
                        toaster.pop('success', "Item deleted!");
                        UserService.goToMainStore();
                    })
                    .error(errorService.alert);
            };

            $scope.form = {};
            $scope.saveComment = function (comment) {
                //$scope.form = {};
                $scope.item.newComment = '';
                $scope.form.postForm.$setPristine();
                $scope.form.postForm.$setUntouched();
                $scope.seeMore = true;
                rest.path = 'v1/comments';
                rest.postModel({content: comment, item_id: $scope.item.id}).success(function () {
                    toaster.pop('success', "Commented");
                    $scope.item.comments.push({
                        authorFullName: UserService.getUserFullName(),
                        content: comment,
                        authorFacebookAvatar: $scope.profile.avatar_url
                    });
                }).error(errorService.alert);
            };

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
                toaster.pop('success', 'File uploaded!');
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
                    toaster.pop('success', 'Success!');
                    $scope.showConfirm = false;
                }).error(errorService.exception);
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
                }).error(errorService.alert);
            };

            $scope.toggle = function (scope) {
                scope.toggle();
            };

            $scope.confirmBuying = function () {
                if (!$scope.profile.address && !$scope.profile.city && !$scope.profile.state && !$scope.profile.zipcode) {
                    toaster.pop('warning', 'You should enter and verify your address in profile section');
                    $scope.showConfirm = false;
                } else {
                    $scope.showConfirm = true;
                    $timeout(function () {
                        if ($stateParams !== '0') {
                            $location.url($stateParams.storeurl + '/' + $stateParams.itemurl + '/0#form-end');
                        }
                    }, 450);
                }
            };

            //Label section
            $scope.getLabel = function (isell, ev) {
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
                }).error(errorService.alert);
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
                        toaster.pop('success', 'Label sent');
                    }
                }).error(errorService.alert);
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
                    console.log(item);
                    toaster.pop('success', 'Duplicated');
                }).error(errorService.alert);
            };


        }
    ])
    .controller('ItemAdd', ['$scope', 'rest', 'toaster', 'ITEM_STATUS', 'API_URL',
        'errorService', 'UserService', 'cfpLoadingBar', '$rootScope', 'PLUPLOAD_RESIZE_CONFIG', '$mdDialog',
        'itemsAmount',
        function ($scope, rest, toaster, ITEM_STATUS, API_URL,
                  errorService, UserService, cfpLoadingBar, $rootScope, PLUPLOAD_RESIZE_CONFIG, $mdDialog,
                  itemsAmount) {
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
                        toaster.pop('success', 'Saved');
                        itemsAmount.incrementItemsAmount();
                        $rootScope.$broadcast('newItem', item);
                    }).error(errorService.alert);
                } else {
                    rest.path = 'v1/user-items';
                    rest.postModel($scope.item).success(function (item) {
                        toaster.pop('success', 'Saved');
                        itemsAmount.incrementItemsAmount();
                        $rootScope.$broadcast('newItem', item);
                    }).error(errorService.alert);
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
                toaster.pop('success', 'File uploaded!');
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
        '$auth', 'errorService', '$state', '$location', 'rest',
        function ($scope, $rootScope, $timeout, $stateParams, UserService, $auth, errorService, $state, $location,
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

                    }, errorService.satellizerAlert);
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
                    }).error(errorService.simpleAlert);
                    $scope.item.myLike = {};
                } else {
                    rest.path = 'v1/my-likes/' + $scope.item.myLike.id;
                    rest.deleteModel().success(function () {
                        delete($scope.item.myLike);
                        $scope.item.likesAmount--;
                    }).error(errorService.simpleAlert);
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
                            }, errorService.satellizerAlert);
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
    .controller('InstagramImport', ['$scope', '$http', 'API_URL', 'errorService', 'UserService',
        'itemsAmount', '$mdDialog', '$mdMedia', 'rest',
        function ($scope, $http, API_URL, errorService, UserService, itemsAmount,
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
                }).error(errorService.alert);
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
                $http.post(API_URL + 'v1/uploader/item-import', items).success(function (data) {
                    itemsAmount.addItemsAmount(items.length);
                    $mdDialog.show({
                        controller: 'ProfileIndex',
                        templateUrl: 'app/components/profile/profile.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        fullscreen: $mdMedia('xs')
                    });
                    UserService.goToMainStore();

                }).error(errorService.alert);
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
