'use strict';

angular.module('instastore')
    .controller('ItemIndex', ['$scope', 'rest', 'toaster', 'UserService', '$stateParams', '$rootScope',
        '$state', 'feedHelper', 'errorService', '$filter', 'ITEM_STATUS', '$auth',
        function ($scope, rest, toaster, UserService, $stateParams, $rootScope,
                  $state, feedHelper, errorService, $filter, ITEM_STATUS, $auth) {
            $scope.$on('newItem', function (event, item) {
                if (item) $scope.items.unshift(item);
                $scope.showPanel = false;
            });

            var store;
            if (!UserService.isYourStore()) {

                $rootScope.isSeller = false;

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
                $rootScope.isSeller = true;
                rest.path = 'v1/my-items';
                rest.models().success(function (data) {
                    if (data.length === 0 && UserService.isSeller()) $scope.showPanel = true;
                    $scope.items = data;
                }).error(errorService.simpleAlert);
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
        'CLIENT_URL', 'PLUPLOAD_RESIZE_CONFIG', 'ITEMSELLTRANSACTION_STATUS', '$filter', '$http', 'ngDialog', '$window',
        'uiGmapGoogleMapApi', '$auth', '$rootScope',
        function ($scope, rest, toaster, $state, feedHelper, errorService, UserService, $stateParams,
                  $location, $anchorScroll, $timeout, API_URL, cfpLoadingBar, CLIENT_URL, PLUPLOAD_RESIZE_CONFIG,
                  ITEMSELLTRANSACTION_STATUS, $filter, $http, ngDialog, $window, uiGmapGoogleMapApi, $auth, $rootScope) {

            $rootScope.curImageHeight = [];

            uiGmapGoogleMapApi
                .then(function () {
                    return uiGmapGoogleMapApi;
                })
                .then(function () {
                    $scope.renderMap = true;
                });

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
                    $state.go('grid');
                }
            }

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


            $scope.save = function () {
                $scope.item.item_url = $scope.item.title;
                rest.path = 'v1/user-items';
                rest.putModel($scope.item).success(function (item) {
                    toaster.pop('success', "Saved");
                    $state.transitionTo('itemview', {storeurl: $stateParams.storeurl, itemurl: item.item_url, tab: 4});
                }).error(errorService.alert);
            };

            $scope.removeImage = function (thumb) {
                var index = $scope.item.images.indexOf(thumb);
                $scope.item.images.splice(index, 1);
                rest.path = 'v1/item-images/' + thumb.id;
                rest.deleteModel()
                    .success(function () {
                        toaster.pop('success', "Image deleted!");
                    })
                    .error(errorService.alert);
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
                        toaster.pop('success', "Item deleted!");
                        $state.go('grid');
                    })
                    .error(errorService.alert);
            };

            $scope.saveComment = function (comment) {
                rest.path = 'v1/comments';
                $scope.seeMore = true;
                rest.postModel({content: comment, item_id: $scope.item.id}).success(function () {
                    toaster.pop('success', "Commented");
                    $scope.item.comments.push({
                        authorFullName: UserService.getUserFullName(),
                        content: comment,
                        authorFacebookAvatar: $scope.profile.avatar_url
                    });
                    $scope.item.newComment = null;
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
                }
            };

            //Label section
            $scope.getLabel = function (isell) {
                $scope.isellBox = isell.box;
                $http.post(API_URL + 'v1/link/label', {
                    buyerId: isell.buyer.id,
                    itemId: $scope.item.id,
                    itemSellId: isell.id
                }).success(function (label) {
                    if (label.label) {
                        $scope.item.itemSells[0].itemSellTransactions.push({status: 30});
                    }
                    $scope.label = label;
                    ngDialog.open({
                        template: 'app/components/item/label.html',
                        scope: $scope
                    });
                }).error(errorService.alert);
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
                    if ($state.includes('itemview')) {
                        $state.go('itemview')
                    }
                });
            };
        }
    ])
    .controller('ItemAdd', ['$scope', 'rest', 'toaster', 'ITEM_STATUS', 'API_URL', 'ngDialog', 'errorService', 'UserService', 'cfpLoadingBar', '$rootScope', 'PLUPLOAD_RESIZE_CONFIG',
        function ($scope, rest, toaster, ITEM_STATUS, API_URL, ngDialog, errorService, UserService, cfpLoadingBar, $rootScope, PLUPLOAD_RESIZE_CONFIG) {
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
                        $rootScope.$broadcast('newItem', item);
                    }).error(errorService.alert);
                } else {
                    rest.path = 'v1/user-items';
                    rest.postModel($scope.item).success(function (item) {
                        toaster.pop('success', 'Saved');
                        $rootScope.$broadcast('newItem', item);
                    }).error(errorService.alert);
                }
                ngDialog.close();
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
        }
    ])
    .controller('ItemViewTabsCtrl', ['$scope', '$rootScope', '$timeout', '$stateParams', 'UserService',
        '$auth', 'errorService', '$state', '$location',
        function ($scope, $rootScope, $timeout, $stateParams, UserService, $auth, errorService, $state, $location) {

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

            $scope.likeItem = function () {
                $rootScope.showHearts = true;
                $timeout(function () {
                    $rootScope.showHearts = false;
                }, 1000);
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
                                $scope.currentTab = 'app/components/item/view-tab-buy.html';
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
    .controller('ItemLocation', ['$scope', '$rootScope', 'uiGmapGoogleMapApi', function ($scope, $rootScope, uiGmapGoogleMapApi) {
        uiGmapGoogleMapApi.then(function () {
            if ($rootScope.store) {
                $scope.map = {
                    center: {latitude: $rootScope.store.store_long, longitude: $rootScope.store.store_lat},
                    zoom: 14
                };
                $scope.staticMarker = {id: 'store-marker'};
                $scope.staticMarker.coords = {
                    latitude: $rootScope.store.store_long,
                    longitude: $rootScope.store.store_lat
                };
            }
        });
    }])
    .controller('InstagramImport', ['$scope', '$http', 'API_URL', 'errorService', function ($scope, $http, API_URL, errorService) {

        $http.get(API_URL + 'v1/link/instagram-media').success(function (data) {
            $scope.items = data;
        }).error(errorService.alert);

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
