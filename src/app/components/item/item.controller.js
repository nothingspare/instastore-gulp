'use strict';

angular.module('instastore')
    .controller('ItemIndex', ['$scope', 'rest', 'toaster', 'UserService', '$stateParams', '$rootScope', '$state',
        function ($scope, rest, toaster, UserService, $stateParams, $rootScope, $state) {

            $scope.pageClass = 'page-buyerprofile3';

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
                    ;
                    rest.path = 'v1/items';
                    rest.models({user_id: store.user_id}).success(function (data) {
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
        }])
    .controller('ItemGridIndex', ['$scope', 'rest', 'toaster', 'UserService', '$stateParams', '$rootScope', '$state',
        function ($scope, rest, toaster, UserService, $stateParams, $rootScope, $state) {

            $scope.pageClass = 'page-buyerprofile1';

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
                    ;
                    rest.path = 'v1/items';
                    rest.models({user_id: store.user_id}).success(function (data) {
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
        }])
    .controller('ItemView', ['$scope', 'rest', 'toaster', '$state',
        function ($scope, rest, toaster, $state) {

            rest.path = 'v1/items';

            $scope.item = {};

            var errorCallback = function (data) {
                toaster.clear();
                if (data.status == undefined) {
                    angular.forEach(data, function (error) {
                        toaster.pop('error', "Field: " + error.field, error.message);
                    });
                }
                else {
                    toaster.pop('error', "code: " + data.code + " " + data.name, data.message);
                }
            };

            rest.model().success(function (data) {
                $scope.item = data;
                $scope.slides = data.images;
            }).error(errorCallback);

            $scope.save = function () {
                rest.putModel($scope.item).success(function () {
                    toaster.pop('success', "Saved");
                }).error(errorCallback);
            };

            $scope.removeImage = function (thumb) {

                rest.path = 'v1/item-images/' + thumb.id;

                rest.deleteModel()
                    .success(function () {
                        var index = $scope.slides.indexOf(thumb);
                        $scope.slides.splice(index, 1);
                        toaster.pop('success', "Image deleted!");
                    })
                    .error(errorCallback);
            };

            $scope.removeItem = function () {

                rest.path = 'v1/items/' + $scope.item.id;
                rest.deleteModel()
                    .success(function () {
                        toaster.pop('success', "Item deleted!");
                        $state.go('item');
                    })
                    .error(errorCallback);
            };
        }
    ])
    .controller('ItemAdd', ['$scope', 'rest', 'toaster', '$upload', 'API_URL', 'ngDialog',
        function ($scope, rest, toaster, $upload, API_URL, ngDialog) {

            rest.path = 'v1/items';

            $scope.item = {title: 'New item title', brand_id: 9, category_id: 1, description: ''};

            $scope.$watch('image2', function () {
                if ($scope.image2) $scope.single($scope.image2);
                console.log('image watch');
            });

            var errorCallback = function (data) {
                toaster.clear();
                if (data.status == undefined) {
                    angular.forEach(data, function (error) {
                        toaster.pop('error', "Field: " + error.field, error.message);
                    });
                }
                else {
                    toaster.pop('error', "code: " + data.code + " " + data.name, data.message);
                }
            };

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
                    }).error(errorCallback);
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
                            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                        }).success(function (data, status, headers, config) {
                            toaster.pop('success', 'File ' + config.file.name + ' uploaded!');
                            console.log('file ' + config.file.name + 'uploaded. Response: ' + data.image_url);
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
                        toaster.pop('success', 'File ' + config.file.name + ' uploaded!');
                        $scope.slides.push({'image_url': data});
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data.image_url);
                    });
                }
            }
        };
    }]);
