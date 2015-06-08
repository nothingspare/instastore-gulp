'use strict';

angular.module('instastore')
    .controller('ItemIndex', ['$scope', 'rest', 'toaster', 'UserService', '$stateParams', '$rootScope', '$state', 'feedHelper', 'errorService', '$filter',
        function ($scope, rest, toaster, UserService, $stateParams, $rootScope, $state, feedHelper, errorService, $filter) {
            $scope.pageClass = 'page-buyerprofile3';
            $scope.showCheckmark = $stateParams.storeurl ? false : true;
            var errorCallback = function (data) {
                toaster.clear();
                toaster.pop('error', "status: " + data.status + " " + data.name, data.message);
            };
            var store;
            if ($stateParams.storeurl) {
                rest.path = 'v1/stores';
                rest.models({store_url: $stateParams.storeurl}).success(function (data) {
                    store = data[0];
                    if (!store) {
                        errorCallback({status: 404, name: 'error', message: 'There is no store with such url'});
                        $state.go('item');
                        return;
                    }
                    rest.path = 'v1/items';
                    rest.models({user_id: store.user_id, status: 20}).success(function (data) {
                        $scope.items = data;
                        $rootScope.bgUrl = store.bg_url;
                        $rootScope.avatarUrl = store.avatar_url;
                        $rootScope.isSeller = false;
                    });
                }).error(errorCallback);
            }
            else {
                rest.path = 'v1/user-items';
                rest.models().success(function (data) {
                    $scope.items = data;
                }).error(errorCallback);
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
                if (item.status == 10) item.status = 20;
                else item.status = 10;
                rest.putModel(item).success(function (data) {
                    var found = $filter('getById')($scope.items, data.id);
                    found.status = data.status;
                }).error(errorService.alert);
            };
        }])
    .controller('ItemView', ['$scope', 'rest', 'toaster', '$state', 'feedHelper', 'errorService',
        function ($scope, rest, toaster, $state, feedHelper, errorService) {

            rest.path = 'v1/items';

            $scope.item = {};

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

            rest.model().success(function (data) {
                $scope.item = data;
                $scope.slides = data.images;
            }).error(errorService.alert);

            $scope.save = function () {
                rest.putModel($scope.item).success(function () {
                    toaster.pop('success', "Saved");
                }).error(errorService.alert);
            };

            $scope.removeImage = function (thumb) {

                rest.path = 'v1/item-images/' + thumb.id;

                rest.deleteModel()
                    .success(function () {
                        var index = $scope.slides.indexOf(thumb);
                        $scope.slides.splice(index, 1);
                        toaster.pop('success', "Image deleted!");
                    })
                    .error(errorService.alert);
            };

            $scope.removeItem = function () {

                rest.path = 'v1/items/' + $scope.item.id;
                rest.deleteModel()
                    .success(function () {
                        toaster.pop('success', "Item deleted!");
                        $state.go('item');
                    })
                    .error(errorService.alert);
            };

            $scope.saveComment = function (comment) {
                rest.path = 'v1/comments';
                $scope.seeMore = true;
                rest.postModel({content: comment, item_id: $scope.item.id}).success(function () {
                    toaster.pop('success', "Commented");
                    $scope.item.comments.push({authorFullName: $scope.item.userFullName, content: comment});
                    $scope.item.newComment = null;
                }).error(errorService.alert);
            };
        }
    ])
    .controller('ItemAdd', ['$scope', 'rest', 'toaster', '$upload', 'API_URL', 'ngDialog', 'errorService',
        function ($scope, rest, toaster, $upload, API_URL, ngDialog, errorService) {

            rest.path = 'v1/items';

            $scope.item = {title: 'New item title', brand_id: 9, category_id: 1, description: ''};

            $scope.$watch('image2', function () {
                if ($scope.image2) $scope.single($scope.image2);
            });

            $scope.save = function () {
                rest.path = 'v1/items';
                if ($scope.item.id) {
                    rest.putModel($scope.item).success(function () {
                        toaster.pop('success', "Saved");
                    }).error(errorCallback);
                }
                else {
                    rest.postModel($scope.item).success(function () {
                        toaster.pop('success', "Saved");
                    }).error(errorService.alert);
                }
                ngDialog.close();
            };


            var dataURItoBlob = function (dataURI) {
                var binary = atob(dataURI.split(',')[1]);
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], {type: mimeString});
            };

            $scope.single = function (image) {
                if ($scope.item.id) {
                    $scope.upload([dataURItoBlob(image.dataURL)]);
                }
                else {
                    rest.path = 'v1/items';
                    rest.postModel($scope.item).success(function (item) {
                        $scope.item.id = item.id;
                        $scope.upload([dataURItoBlob(image.dataURL)]);
                    }).error(errorCallback);
                }

            };

            $scope.upload = function (files) {
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        $upload.upload({
                            url: API_URL + 'v1/item/upload',
                            fields: {
                                'itemId': $scope.item.id
                            },
                            headers: {
                                'Content-Type': file.type
                            },
                            method: 'POST',
                            data: file,
                            file: file
                        }).progress(function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            console.log('File upload: ' + progressPercentage + '% ');
                        }).success(function (data, status, headers, config) {
                            if (data.image_url) {
                                toaster.pop('success', 'File uploaded!');
                            }
                            else errorCallback({
                                message: 'File is not uploaded!',
                                status: 500,
                                name: 'Ooops!',
                                code: 500
                            });
                        });
                    }
                }
            };
        }
    ])
    .controller('ItemViewTabsCtrl', ['$scope', '$rootScope', '$timeout', '$stateParams', function ($scope, $rootScope, $timeout, $stateParams) {

        $scope.onClickTab = function (tab) {
            $scope.currentTab = tab.url;
        }

        $scope.isActiveTab = function (tabUrl) {
            return tabUrl == $scope.currentTab;
        }

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
                    $scope.currentTab = 'app/components/item/view-tab-log.html'
                    break;
                case '3':
                    $scope.currentTab = 'app/components/item/view-tab-social.html'
                    break;
                case '4':
                    $scope.currentTab = 'app/components/item/view-tab-edit.html'
                    break;
                default:
                    $scope.currentTab = 'app/components/item/view-tab-comment.html';
            }
        else
            switch ($stateParams.tab) {
                case '1':
                    $scope.currentTab = 'app/components/item/view-tab-buyer-comment.html';
                    break;
                case '2':
                    $scope.currentTab = 'app/components/item/view-tab-buy.html';
                    break;
                case '3':
                    $scope.currentTab = 'app/components/item/view-tab-buyer-comment.html';
                    $scope.likeItem();
                    break;
                case '4':
                    $scope.currentTab = 'app/components/item/view-tab-location.html'
                    break;
                default:
                    $scope.currentTab = 'app/components/item/view-tab-buyer-comment.html';
            }
    }])
    .controller('ShrinkUploadImageCtrl', ['$scope', '$stateParams', '$upload', 'API_URL', 'toaster', function ($scope, $stateParams, $upload, API_URL, toaster) {

        var dataURItoBlob = function (dataURI) {
            var binary = atob(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            return new Blob([new Uint8Array(array)], {type: mimeString});
        };

        $scope.single = function (image) {
            $scope.upload([dataURItoBlob(image.dataURL)]);
        };

        $scope.upload = function (files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    $upload.upload({
                        url: API_URL + 'v1/item/upload',
                        fields: {
                            'itemId': $stateParams.id
                        },
                        headers: {
                            'Content-Type': file.type
                        },
                        method: 'POST',
                        data: file,
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        toaster.pop('success', 'File uploaded!');
                        delete $scope.image2;
                        $scope.slides.push({'image_url': data.image_url});
                        console.log('file ' + data.image_url + ' uploaded!');
                    });
                }
            }
        };
    }]);
