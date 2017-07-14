var app = angular.module('cbs');

app.controller('cbs.profileDetails.controller',['$scope','$dataService','$routeParams',
function($scope,$dataService,$routeParams) {
    $scope.getSelectedCount = getSelectedCount;
    $scope.selectType = selectType;
    $scope.selectGroup = selectGroup;
    $scope.getSelectedAttributesCount = getSelectedAttributesCount;
    $scope.increasePercentage = increasePercentage;
    $scope.decreasePercentage = decreasePercentage;
    $scope.changeMinimumPercentage = changeMinimumPercentage;
    $scope.changeMaximumPercentage = changeMaximumPercentage;
    $scope.updateGeoCriteriaCount = updateGeoCriteriaCount;
    $scope.updateQuickPickCount = updateQuickPickCount;
    $scope.updateRangeCriteriaCount = updateRangeCriteriaCount;
    $scope.selectCriteria = selectCriteria;
    $scope.currentSelectedCriteria = 'Geo-Criteria';
    $scope.valid = false;
        
        function fetchOptions(hierarchy, callback, index) {
            index = index || 0 ;
            if ($scope.types.length <= index) {
                callback();
                return;
            }

            var type = $scope.types[index];
            type.options = [];
            angular.forEach(hierarchy,function(data){
                if(data.hierarchyType === type.lookupId){
                    type.options.push(data);
                }
            })
            fetchOptions(hierarchy, callback, index + 1);
        }

        function criteriaHierarchy(){

            var optionMap = {};
            var typeMap = {};
            
            $dataService.get('criteriaHierarchy?cbSprofileId='+ $scope.cbsProfileId,function(permissions){
                permissions = permissions || [];
                angular.forEach($scope.types, function(type){
                    typeMap[type.lookupId] = type;
                    type.group1Count = 0;
                    type.group2Count = 0;
                    angular.forEach(type.options, function(option){
                        optionMap[type.lookupId + '$' + option.hierarchyId] = option;
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
            })
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

        function updateGeoCriteriaCount(type){
            var selected = 0;
            var unselected = 0;
            angular.forEach(type.options,function(option){
                if(option.selected === true){
                    selected++;
                    option.group = 1;
                }else{
                    unselected++;
                    option.group =2;
                }
                type.group1Count = selected;
                type.group2Count = unselected;
            })
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

        function updateQuickPickCount(){
            var selected = 0;
            angular.forEach($scope.quickPickTypes,function(quickPickType){
                if(quickPickType.selected === true){
                    selected++;
                }
            });
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
                'attrID':'a1',
                'selected':true
            },{
                'attrID':'a2',
                'selected':false
            },{
                'attrID':'a3',
                'selected':false
            },{
                'attrID':'a4',
                'selected':true
            },{
                'attrID':'a5',
                'selected':true
            }]);
        }

        function fetchAttributes(callback){
            var groupMap = {};
            var attributeMap = {};

            angular.forEach($scope.groups,function(group){
                groupMap[group.lookupId] = group; 
                group.selected = false;
            });

            $scope.groups[0].selected = true;
            $scope.selectedGroup = $scope.groups[0];
            
            getAttributes(function(attributes){
                attributes = attributes || [];
                angular.forEach(attributes,function(attribute){
                    attributeMap[attribute.id] = attribute;
                    var group = groupMap[attribute.rangeID]; 
                    if(group != null){
                        group.attributes = group.attributes || [];
                        group.attributes.push(attribute);
                    }
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
                    if(attribute != null && percentageRangeAndAccess.selected === true){
                        attribute.selected = percentageRangeAndAccess.selected;
                    }
                })
            })
        }

        function selectGroup(group){
            angular.forEach($scope.groups,function(group){
                group.selected = false;
            })
            group.selected = true;
            $scope.selectedGroup = group;
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
            if(attribute.maximumPercentage === null){
                attribute.maximumValue = null;
            }else{
                attribute.maximumValue = attribute.value + (attribute.maximumPercentage*attribute.value)/100 ;
            }
        }

        function decreasePercentage(attribute){
            if(attribute.minimumPercentage === null){
                attribute.minimumValue = null;
            }
            else{
                attribute.minimumValue = attribute.value - (attribute.minimumPercentage*attribute.value)/100 ;
            }
        }

        function changeMinimumPercentage(attribute){
            if(attribute.minimumValue === null){
                attribute.minimumPercentage =null;
            }else{
                attribute.minimumPercentage = ((attribute.value - attribute.minimumValue)/attribute.value)*100;
            }
        }

        function changeMaximumPercentage(attribute){
            if(attribute.maximumValue === null){
                attribute.maximumPercentage = null;
            }else{
                attribute.maximumPercentage = ((attribute.maximumValue - attribute.value)/attribute.value)*100;
            }
        }

        function updateRangeCriteriaCount(){
            angular.forEach($scope.groups,function(group){
                group.selectedAttributeCount = 0;
                angular.forEach(group.attributes,function(attribute){
                    if(attribute.selected === true){
                        group.selectedAttributeCount++;
                    }
                })
            })
        }

        $scope.master = [{
            'id':'Geo-Criteria',
            'selected':true
        },{
            'id':'Quick-Pick',
            'selected':false
        },{
            'id':'Range-Criteria',
            'selected':false
        }];

        function selectCriteria(criteria){
            angular.forEach($scope.master,function(criteria){
                criteria.selected = false;
            })
             criteria.selected = true;
             $scope.currentSelectedCriteria = criteria.id;
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

        function init(){

            //get the routeParameter i.e profile id
            $scope.cbsProfileId = $routeParams.id;

            $dataService.get('lookups?lookupType=HierarchyTypes',function(hierarchyTypes){
                $scope.types = hierarchyTypes;
                $dataService.get('hierarchy',function(hierarchy){
                if($scope.types != null && hierarchy != null){
                    fetchOptions(hierarchy,criteriaHierarchy);
                }
                });
            });

            $dataService.get('lookups?lookupType=RangeGroups',function(rangeGroups){
                $scope.groups = rangeGroups;
                if($scope.groups != null){
                    fetchAttributes(criteriaRange);
                }
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
                //console.log($scope.groups);
            });            
}

        $scope.links = [{
            'id':'geo-criteria',
            'img':'/images/psea-assets/geo/geo.png',
            'imgSelected':'/images/psea-assets/geo-selected/geo-selected.png',
            'caption':'Geo Criteria',
            'selected':true
        },{
            'id':'quick-pick',
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
            'id':'quick-pick',
            'url':'/views/CBS/profiles/details/i_QuickTypesView',
            'selected':false
        },{
            'id':'range-criteria',
            'url':'/views/CBS/profiles/details/i_RangeCriteriaView',
            'selected':false
        },{
            'id':'check-criteria',
            'url':'/views/CBS/profiles/details/i_CheckCriteriaView',
            'selected':false
        }];

        init();
    }
]);



