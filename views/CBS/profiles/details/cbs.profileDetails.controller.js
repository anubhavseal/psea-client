var app = angular.module('cbs');

app.controller('cbs.profileDetails.controller', function($scope) {
    $scope.getSelectedCount = getSelectedCount;
    $scope.selectType = selectType;
    $scope.selectGroup = selectGroup;
    $scope.getSelectedAttributesCount = getSelectedAttributesCount;
    $scope.increasePercentage = increasePercentage;
    $scope.decreasePercentage = decreasePercentage;
        
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

        function getQuickPickTypes(callback){
            callback([{
                'id':1,
                'caption':'Montogomery County'
            },{
                'id':2,
                'caption':'IU Montgomery'
            },{
                'id':3,
                'caption':'Mideastern Region',
            },{
                'id':4,
                'caption':'Cluster:STRANZ, KAREN'
            },
            {
                'id':5,
                'caption':'Contiguous District'
            }])
        }

        function getQuickPickTypesAccess(callback){
            callback([{
                'id':1,
                'access':true
            },{
                'id':2,
                'access':false
            },{
                'id':3,
                'access':false
            },{
                'id':4,
                'access':false
            },{
                'id':5,
                'access':false
            }])
        }

        function populateQuickPickTypeAccess(){
            getQuickPickTypesAccess(function(permissions){
                permissions = permissions || [];
                var quickPickTypeMap = {};
                angular.forEach($scope.quickPickTypes,function(type){
                    quickPickTypeMap[type.id] = type;
                    type.selected = false;
                })
                angular.forEach(permissions,function(permission){
                   var quickPickType = quickPickTypeMap[permission.id];
                   if(quickPickType != null && permission.access === true){
                        quickPickType.selected = true;
                   }
                })
            })
        }


        function getGroups(callback){
            callback([{
                'id':'g1',
                'caption':'Range 1'
            },{
                'id':'g2',
                'caption':'Range 2'
            },{
                'id':'g3',
                'caption':'Range 3'
            },{
                'id':'g4',
                'caption':'Range 4'
            },{
                'id':'g5',
                'caption':'Range 5'
            }]);
        }

        function getAttributes(callback){
            callback([{
                'id':'a1',
                'caption':'Starting Salary',
                'value':529792,
                'rangeID':'g1'
            },{
                'id':'a2',
                'caption':'Career Rate',
                'value':89652,
                'rangeID':'g1'

            },{
                'id':'a3',
                'caption':'Average BU Salary',
                'value':77098,
                'rangeID':'g1'

            },{
                'id':'a4',
                'caption':'% with Master Degree',
                'value':726,
                'rangeID':'g2'

            },{
                'id':'a5',
                'caption':'Career Earnings',
                'value':2523674,
                'rangeID':'g2'

            }]);
        }

        function getPercentageRangeAndAccess(callback){
            callback([{
                'minValue':100,
                'maxValue':200,
                'attrID':'a1',
                'selected':true
            },{
                'minValue':50,
                'maxValue':300,
                'attrID':'a2',
                'selected':false
            },{
                'minValue':500,
                'maxValue':1000,
                'attrID':'a3',
                'selected':false
            },{
                'minValue':120,
                'maxValue':280,
                'attrID':'a4',
                'selected':true
            },{
                'minValue':140,
                'maxValue':290,
                'attrID':'a5',
                'selected':true
            }]);
        }

        function fetchAttributes(callback){
            var groupMap = {};
            var attributeMap = {};
            if($scope.groups == null){
                return;
            }
        
            angular.forEach($scope.groups,function(group){
                groupMap[group.id] = group; 
                group.selected = false;
            });

            $scope.groups[0].selected = true;
            $scope.selectedGroup = $scope.groups[0];
            
            getAttributes(function(attributes){
                attributes = attributes || [];
                angular.forEach(attributes,function(attribute){
                    attributeMap[attribute.id] = attribute;
                    var group = groupMap[attribute.rangeID]; 
                    group.attributes = group.attributes || [];
                    group.attributes.push(attribute);
                })

                callback(attributeMap);
                return;
            });
        }
        

        function PercentageRangeAndAccess(attributeMap){
            getPercentageRangeAndAccess(function(percentageRangeAndAccess){
                percentageRangeAndAccess = percentageRangeAndAccess || [];
                angular.forEach(percentageRangeAndAccess,function(percentageRangeAndAccess){
                    var attribute = attributeMap[percentageRangeAndAccess.attrID];
                    attribute.selected = percentageRangeAndAccess.selected;
                    attribute.minValue = percentageRangeAndAccess.minValue;
                    attribute.maxValue = percentageRangeAndAccess.maxValue;
                })
            })
        }

        function selectGroup(group){
            angular.forEach($scope.groups,function(group){
                group.selected = false;
            })
            group.selected = true;
            $scope.selectedGroup = group;
            console.log($scope.selectedGroup);
        }

        function getSelectedAttributesCount(attributes){
            var count = 0;
            angular.forEach(attributes,function(attribute){
                if(attribute.selected === true){
                    count++;
                }
            })
            return count;
        }

        function increasePercentage(attribute){
            attribute.maxValue = attribute.value + (attribute.maximumPercentage*attribute.value)/100 ;
        }

        function decreasePercentage(attribute){
            attribute.minValue = attribute.value - (attribute.minimumPercentage*attribute.value)/100 ;
        }

        $scope.setLayout = function(link){
           var viewMap = {};
           angular.forEach($scope.views,function(view){
               viewMap[view.id]=view;
               view.selected = false;
           })
           angular.forEach($scope.links,function(link){
               link.selected = false;
           })
            link.selected = true;
            viewMap[link.id].selected = true;
            
        }

        $scope.links = [{
            'id':'geo-criteria',
            'img':'/images/psea-assets/geo/geo.png',
            'imgSelected':'/images/psea-assets/geo-selected/geo-selected.png',
            'caption':'Geo Criteria',
            'selected':true
        },{
            'id':'quick-pick-criteria',
            'img':'/images/psea-assets/quick/quick.png',
            'imgSelected':'/images/psea-assets/quick-selected/shape.png',
            'caption':'Quick Pick',
            'selected':false
        },{
            'id':'range-criteria',
            'img':'/images/psea-assets/range/range.png',
            'imgSelected':'/images/psea-assets/range-selected/range-selected.png',
            'caption':'Range Criteria',
            'selected':false
        },{
            'id':'check-criteria',
            'img':'/images/psea-assets/check/check.png',
            'imgSelected':'/images/psea-assets/check-selected/shape.png',
            'caption':'Check Criteria',
            'selected':false
        }];

        $scope.views=[{
            'id':'geo-criteria',
            'url':'/views/CBS/profiles/details/i_GeoCriteriaView',
            'selected':true
        },{
            'id':'quick-pick-criteria',
            'url':'/views/CBS/profiles/details/i_QuickTypesView',
            'selected':false
        },{
            'id':'range-criteria',
            'url':'/views/CBS/profiles/details/i_RangeCriteriaView',
            'selected':false
        },{
            'id':'check-criteria',
            'url':'/views/CBS/profiles/details/i_GeoCriteriaView',
            'selected':false
        }];

        function init(){
            getTypes(function(types){
                $scope.types = types;
                fetchOptions(populateAccess);
            });

            getQuickPickTypes(function(quickPickTypes){
                $scope.quickPickTypes = quickPickTypes;
                if($scope.quickPickTypes){
                    populateQuickPickTypeAccess();
                }
            });

            getGroups(function(groups){
                $scope.groups = groups;
                fetchAttributes(PercentageRangeAndAccess);
                console.log($scope.groups);
            });
        }        

        init();
    }
);
