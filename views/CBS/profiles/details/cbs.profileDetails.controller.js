var app = angular.module('cbs');

app.controller('cbs.profileDetails.controller',['$scope','$dataService','$routeParams','cbsCache',
function($scope,$dataService,$routeParams,$cbsCache) {
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
            angular.forEach(hierarchy,function(data){
                
            })

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
                        optionMap[option.hierarchyId] = option;
                        option.group = 2;
                        option.selected = false;
                        type.group2Count++;
                    });
                });

                angular.forEach(permissions, function(permission){
                    var option = optionMap[permission.hierarchyId];
                    if (option != null) {
                        option.group = 1;
                        option.selected = true;
                        var type = typeMap[option.hierarchyType];
                        type.group1Count++;
                        type.group2Count--;
                    }
                });
            })
            if ($scope.types != null && $scope.types.length > 0) {
                    $scope.selectType($scope.types[0]);
                }
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

        function populateQuickPickTypeAccess(){

            $dataService.get('CBSprofiles/' + $scope.cbsProfileId,function(profile){
                console.log(profile);
                angular.forEach($scope.quickPickTypes,function(quickPickType){
                    if(quickPickType.hierarchyType === 521){
                        quickPickType.hierarchyName = 'Cluster:' + quickPickType.hierarchyName;
                        quickPickType.selected = profile[0].quickCluster;
                    }else if(quickPickType.hierarchyType === 522){
                        quickPickType.hierarchyName = quickPickType.hierarchyName + ' ' + 'Region';
                        quickPickType.selected = profile[0].quickRegion;
                    }else if(quickPickType.hierarchyType === 523){
                        quickPickType.hierarchyName = quickPickType.hierarchyName + ' ' +'IU';
                        quickPickType.selected = profile[0].quickIU;
                    }else{
                        quickPickType.hierarchyName = quickPickType.hierarchyName + ' ' +'County';
                        quickPickType.selected = profile[0].quickCounty;
                    }
                });
                console.log($scope.quickPickTypes);
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

        function filterSchoolTypes(type){
            if(type.lookupId === 501 || type.lookupId === 502 || type.lookupId === 503){
                return type;
            }
        }

        function filterHierarchyTypes(type){
            if(type.lookupId === 521 || type.lookupId === 522 || type.lookupId === 523
            || type.lookupId === 524 || type.lookupId === 525){
                return type;
            }
        }

        function init(){

            //get the routeParameter i.e profile id and home district id
            $scope.cbsProfileId = $routeParams.profileId;
            $scope.homeHierarchyId = $routeParams.homeDistrictId;
            $dataService.get('lookups?lookupType.in=HierarchyTypes,SchoolTypes',function(hierarchyTypes){
                $scope.schoolTypes = hierarchyTypes.filter(filterSchoolTypes);
                $scope.types = hierarchyTypes.filter(filterHierarchyTypes).reverse();
                $dataService.get('hierarchy',function(hierarchy){
                if($scope.types != null && hierarchy != null){
                    fetchOptions(hierarchy,criteriaHierarchy);
                }
                });
            });
            
            
            $dataService.get('CBSprofiles/' + $scope.homeHierarchyId + '/homedata',
            function(homeData){
                var districtId = homeData[0].districtId;
                var countyId = homeData[0].countyId;
                var iuId = homeData[0].iuId;
                var regionId = homeData[0].regionId;
                var clusterId = homeData[0].clusterId;

                var str = countyId+','+iuId+','+regionId+','+clusterId;
                console.log('str',str);

                $dataService.get('hierarchy?hierarchyId.in=' + 
                str,function(data){
                    if(data != null){
                        $scope.quickPickTypes = data.reverse();
                        populateQuickPickTypeAccess();
                    }
                    
                })
            })
            
            getGroups(function(groups){
                $scope.groups = groups;
                fetchAttributes(PercentageRangeAndAccess);
            });            
            console.log($cbsCache.get('homeDistrictId'));
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





