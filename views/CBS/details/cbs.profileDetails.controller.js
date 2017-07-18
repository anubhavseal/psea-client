var app = angular.module('cbs');

app.controller('cbs.profileDetails.controller',[
'$scope',
'$dataService',
'$routeParams',
'cbsCache',
function($scope,$dataService,$routeParams,$cbsCache) {
    $scope.getSelectedCount = getSelectedCount;
    $scope.selectType = selectType;

    $scope.selectRangeGroup = selectRangeGroup;
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
        
    /*
    ################################################################################
                            Geo Criteria
    ################################################################################
    */

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
            });

            fetchOptions(hierarchy, callback, index + 1);
        }

        function criteriaHierarchy(){

            var optionMap = {};
            var typeMap = {};
            
            $dataService.getFromCache('criteriaHierarchy?cbSprofileId='+ $scope.cbsProfileId,function(permissions){
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
                    console.log('##option:' , option)
                }else{
                    unselected++;
                    option.group =2;
                }
                type.group1Count = selected;
                type.group2Count = unselected;
            })
        }
    /*
    ################################################################################
                            End of Geo Criteria
    ################################################################################
    */
    /*
    ################################################################################
                                 Quick Pick
    ################################################################################
    */
    
        function populateQuickPickTypeAccess(){

            $dataService.getFromCache('CBSprofiles/' + $scope.cbsProfileId,function(profile){
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
    /*
    ################################################################################
                            End of Quick Pick
    ################################################################################
    */    
    /*
    ################################################################################
                            Range Criteria
    ################################################################################
    */

        function fetchAttributes(attributes,callback){
            var rangeGroupMap = {};
            var attributeMap = {};

            angular.forEach($scope.rangeGroups,function(rangeGroup){
                rangeGroupMap[rangeGroup.lookupId] = rangeGroup; 
                rangeGroup.selected = false;
            });

            $scope.rangeGroups[0].selected = true;
            $scope.selectedRangeGroup = $scope.rangeGroups[0];

            $dataService.getFromCache('CBSprofiles/' + $scope.homeHierarchyId + '/homedata',
            function(homeData){
                angular.forEach(attributes,function(attribute){
                    var temp = attribute.sourceLookup.toLowerCase();
                    attribute.homeValue = homeData[0][temp];
                    attributeMap[attribute.attributeId] = attribute;
                    var rangeGroup = rangeGroupMap[attribute.attributeGroupId]; 
                    if(rangeGroup != null){
                        rangeGroup.attributes = rangeGroup.attributes || [];
                        rangeGroup.attributes.push(attribute);
                    }
                });
            }); 

            callback(attributeMap);
            return;
        }

        function criteriaRange(attributeMap){
            $dataService.getFromCache('criteriaRanges?cbSprofileId=',function(permissions){
                permissions = permissions || [];
                angular.forEach(permissions,function(permission){
                    var attribute = attributeMap[permission.attributeId];
                    if(attribute != null){
                        attribute.minPercent = permission.minPercent;
                        attribute.maxPercent = permission.maxPercent;
                        attribute.selected = true;
                    }
                });
            });
        }

        function selectRangeGroup(rangeGroup){
            angular.forEach($scope.rangeGroups,function(rangeGroup){
                rangeGroup.selected = false;
            })
            rangeGroup.selected = true;
            $scope.selectedRangeGroup = rangeGroup;
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
            if(attribute.maxPercent === null){
                attribute.maxValue = null;
            }else{
                attribute.maxValue = attribute.homeValue + (attribute.maxPercent*attribute.homeValue)/100 ;
            }
        }

        function decreasePercentage(attribute){
            if(attribute.minPercent === null){
                attribute.minValue = null;
            }
            else{
                attribute.minValue = attribute.homeValue - (attribute.minPercent*attribute.homeValue)/100 ;
            }
        }

        function changeMinimumPercentage(attribute){
            if(attribute.minValue === null){
                attribute.minPercent =null;
            }else{
                attribute.minPercent = ((attribute.homeValue - attribute.minValue)/attribute.homeValue)*100;
            }
        }

        function changeMaximumPercentage(attribute){
            if(attribute.maxValue === null){
                attribute.maxPercent = null;
            }else{
                attribute.maxPercent = ((attribute.maxValue - attribute.homeValue)/attribute.homeValue)*100;
            }
        }

        function updateRangeCriteriaCount(){
            angular.forEach($scope.rangeGroups,function(rangeGroup){
                rangeGroup.selectedAttributeCount = 0;
                angular.forEach(rangeGroup.attributes,function(attribute){
                    if(attribute.selected === true){
                        rangeGroup.selectedAttributeCount++;
                    }
                })
            })
        }

    /*
    ################################################################################
                           End of Range Criteria
    ################################################################################
    */
    /*
    ################################################################################
                           Filtering Out Received LookUp Array
    ################################################################################
    */

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

        function filterRangeGroups(type){
            if(type.lookupId === 511 || type.lookupId === 512 ||
            type.lookupId === 513 || type.lookupId === 514 || type.lookupId === 515){
                return type;
            }
        }
    /*
    ################################################################################
                            End of Filtering
    ################################################################################
    */
    /*
    ################################################################################
                            Initialization
    ################################################################################
    */
        function init(){

            //get the routeParameter i.e profile id and home district id
            $scope.recentProfile = $cbsCache.get('recentProfile');
            $scope.cbsProfileId = $routeParams.profileId;
            $scope.homeHierarchyId = $routeParams.homeDistrictId;
            $dataService.getFromCache('lookups?lookupType.in=HierarchyTypes,SchoolTypes,RangeGroups',
            function(lookUpTypes){
                $scope.schoolTypes = lookUpTypes.filter(filterSchoolTypes);
                $scope.types = lookUpTypes.filter(filterHierarchyTypes).reverse();
                $scope.rangeGroups = lookUpTypes.filter(filterRangeGroups);
                $dataService.getFromCache('hierarchy',function(hierarchy){
                    if($scope.types != null && hierarchy != null){
                        fetchOptions(hierarchy,criteriaHierarchy);
                    }
                });
                $dataService.getFromCache('attributes',function(attributes){
                    if($scope.rangeGroups != null & attributes != null){
                        fetchAttributes(attributes,criteriaRange);
                    }
                })
            });
            
            
            $dataService.getFromCache('CBSprofiles/' + $scope.homeHierarchyId + '/homedata',
            function(homeData){
                var districtId = homeData[0].districtId;
                var countyId = homeData[0].countyId;
                var iuId = homeData[0].iuId;
                var regionId = homeData[0].regionId;
                var clusterId = homeData[0].clusterId;

                var str = countyId+','+iuId+','+regionId+','+clusterId;

                $dataService.getFromCache('hierarchy?hierarchyId.in=' + 
                str,function(data){
                    if(data != null){
                        $scope.quickPickTypes = data.reverse();
                        populateQuickPickTypeAccess();
                    }
                    
                })
            })            
        }
    /*
    ################################################################################
                            End of Initialization
    ################################################################################
    */

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
            'url':'/views/CBS/details/i_GeoCriteriaView',
            'selected':true
        },{
            'id':'quick-pick',
            'url':'/views/CBS/details/i_QuickTypesView',
            'selected':false
        },{
            'id':'range-criteria',
            'url':'/views/CBS/details/i_RangeCriteriaView',
            'selected':false
        },{
            'id':'check-criteria',
            'url':'/views/CBS/details/i_CheckCriteriaView',
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
        // function changeProfile(profile){
        //     $cbsCache.put('recentProfile',profile)
        //     $cbsCache.put('index',$scope.profiles.indexOf(profile));
        // }
        init();
    }
]);





