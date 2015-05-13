'use strict';

angular.module('instastore')
    .controller('ItemIndex', ['$scope', 'rest', 'toaster', function ($scope, rest, toaster) {

        $scope.pageClass = 'page-buyerprofile3';

        rest.path = 'v1/items';

        var errorCallback = function (data) {
            toaster.clear();
            toaster.pop('error', "status: " + data.status + " " + data.name, data.message);
        };

        rest.models().success(function (data) {
            $scope.items = data;
        }).error(errorCallback);
    }])
    .controller('ItemGridIndex', ['$scope', 'rest', 'toaster', function ($scope, rest, toaster) {

        $scope.pageClass = 'page-buyerprofile1';

        if (!$scope.items) {

            rest.path = 'v1/items';

            var errorCallback = function (data) {
                toaster.clear();
                toaster.pop('error', "status: " + data.status + " " + data.name, data.message);
            };

            rest.models().success(function (data) {
                $scope.items = data;
            }).error(errorCallback);

        }
    }])
    .controller('ItemView', ['$scope', 'rest', 'toaster',
        function ($scope, rest, toaster) {

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
        }
    ])
    .controller('ItemAdd', ['$scope', 'rest', 'toaster', '$upload', 'API_URL', 'ngDialog',
        function ($scope, rest, toaster, $upload, API_URL, ngDialog) {

            rest.path = 'v1/items';

            $scope.item = {title: 'New item title', brand_id: 9, category_id: 1, description: 'Description'};

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
                rest.postModel($scope.item).success(function () {
                    toaster.pop('success', "Saved");
                }).error(errorCallback);
                ngDialog.close();
            };


            $scope.removeImage = function (thumb) {

                rest.path = 'v1/item-images/' + thumb.id;

                rest.deleteModel().success(function () {
                    var index = $scope.slides.indexOf(thumb);
                    $scope.slides.splice(index, 1);
                    toaster.pop('success', "Image deleted!");
                })
                    .error(errorCallback);
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
                            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
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
                    $scope.currentTab ='app/components/item/view-tab-buy.html';
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
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    });
                }
            }
        };
    }]);
