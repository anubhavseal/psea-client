var app = angular.module('cbs');

app.controller('createProfile.controller', function($scope) {
        $scope.getSelectedCount = getSelectedCount;
        $scope.selectType = selectType;

        function selectType(selectedType){
            angular.forEach($scope.types, function(type){
                type.selected = false;
            });
            selectedType.selected = true;
        }

        function getSelectedCount(type) {
            var selectedCount = 0;
            angular.forEach(type.options, function(option){
                if (option.selected) {
                    selectedCount++;
                }
            });
            return selectedCount == 0 ? 'None Selected' : selectedCount;
        }

        function getTypes(callback) {
            callback([{
                    id: 'district',
                    caption: 'District',
                    'dataFunction': 'getDistrict'
                },
                {
                    id: 'county',
                    caption: 'County',
                    'dataFunction': 'getCounty'
                }
            ]);
        }

        function getDistrict(callback) {
            callback([{
                id: "d1",
                caption: "Ambridge Area"
            }, {
                id: "d2",
                caption: "Altoona Area"
            }, {
                id: "d3",
                caption: "Apolo Ridge"
            }, {
                id: "d4",
                caption: "Athens Area"
            }, {
                id: "d5",
                caption: "Apolo Ridge5"
            }, {
                id: "d6",
                caption: "Athens Area6"
            }, {
                id: "d7",
                caption: "Apolo Ridge7"
            }, {
                id: "d8",
                caption: "Athens Area8"
            }, {
                id: "d9",
                caption: "Apolo Ridge9"
            }, {
                id: "d10",
                caption: "Athens Area10"
            }, {
                id: "d11",
                caption: "Apolo Ridge11"
            }, {
                id: "d12",
                caption: "Athens Area12"
            }, {
                id: "d13",
                caption: "Apolo Ridge13"
            }, {
                id: "d14",
                caption: "Athens Area14"
            }, {
                id: "d15",
                caption: "Apolo Ridge15"
            }, {
                id: "d16",
                caption: "Athens Area16"
            }, {
                id: "d17",
                caption: "Apolo Ridge17"
            }, {
                id: "d18",
                caption: "Athens Area18"
            }, {
                id: "d19",
                caption: "Apolo Ridge19"
            }, {
                id: "d20",
                caption: "Athens Area20"
            }, {
                id: "d21",
                caption: "Apolo Ridge21"
            }, {
                id: "d22",
                caption: "Athens Area22"
            }, {
                id: "d23",
                caption: "Apolo Ridge23"
            }, {
                id: "d24",
                caption: "Athens Area24"
            }, {
                id: "d25",
                caption: "Arizona25"
            }]);
        }

        function getCounty(callback) {
            callback([{
                id: "c1",
                caption: "Cambridge Area"
            }, {
                id: "c2",
                caption: "Caltoona Area"
            }]);
        }

        function getAccess(callback) {
            callback([
                {
                    "id": "d1",
                    "type": "district",
                    "access": true
                },
                {
                    "id": "d3",
                    "type": "district",
                    "access": true
                },
                {
                    "id": "d2",
                    "type": "district",
                    "access": false
                },
                {
                    "id": "d4",
                    "type": "district",
                    "access": false
                },
                {
                    "id": "d5",
                    "type": "district",
                    "access": false
                }
            ]);
        }

        function fetchOptions(callback, index) {
            index = index || 0 ;
            if ($scope.types == null || $scope.types.length <= index) {
                callback();
                return;
            }

            var type = $scope.types[index];

            if (type.dataFunction == null || type.dataFunction == ''){
                fetchOptions(callback, index + 1);
                return;
            }

            var afterFetchOptions = function(options) {
                type.options = options || [];

                fetchOptions(callback, index + 1);
                return;
            }

            eval(type.dataFunction + '(afterFetchOptions)');
        }

        function init(){
            getTypes(function(types){
                $scope.types = types;
                fetchOptions(populateAccess);
            });
        }

        function populateAccess(){
            getAccess(function(permissions){
                permissions = permissions || [];

                var optionMap = {};
                var typeMap = {};

                angular.forEach($scope.types, function(type){
                    typeMap[type.id] = type;
                    type.group1Count = 0;
                    type.group2Count = 0;
                    angular.forEach(type.options, function(option){
                        optionMap[type.id + '$' + option.id] = option;
                        option.group = 2;
                        option.selected = false;
                        type.group2Count++;
                    });
                });

                angular.forEach(permissions, function(permission){
                    var option = optionMap[permission.type + '$' + permission.id];
                    if (option != null && permission.access === true) {
                        option.group = 1;
                        option.selected = true;
                        var type = typeMap[permission.type];
                        type.group1Count++;
                        type.group2Count--;
                    }
                });

                if ($scope.types != null && $scope.types.length > 0) {
                    $scope.selectType($scope.types[0]);
                }
            });
        }

        init();
    }
);
