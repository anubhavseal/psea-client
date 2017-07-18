angular.module('cbs').controller('cbs.profiles.edit.controller',[ '$scope', '$dataService', '$routeParams', '$loader', '$recentProfile', function($scope, $dataService, $routeParams, $loader, $recentProfile) {
	$scope.showLink = showLink;
	
    $scope.getSelectedCount = getSelectedCount;
    $scope.selectType = selectType;

    $scope.selectRangeGroup = selectRangeGroup;
    $scope.getSelectedAttributesCount = getSelectedAttributesCount;
    $scope.increasePercentage = increasePercentage;
    $scope.decreasePercentage = decreasePercentage;
    $scope.changeMinimumPercentage = changeMinimumPercentage;
    $scope.changeMaximumPercentage = changeMaximumPercentage;

    $scope.updateGeoCriteriaCount = updateGeoCriteriaCount;
    $scope.updateRangeCriteriaCount = updateRangeCriteriaCount;
    $scope.selectCriteria = selectCriteria;
    $scope.currentSelectedCriteria = 'Geo-Criteria';
	$scope.getSelectedAttributeCount = getSelectedAttributeCount;
        
    /*
    ################################################################################
                            Geo Criteria
    ################################################################################
    */

        function getSelectedAttributeCount(rangeGroup) {
			var selected = 0;
			angular.forEach(rangeGroup.attributes, function(attribute){
				if (attribute.selected) {
					selected++;
				}
			})
			return selected;
		}

        function criteriaHierarchy(){

            var optionMap = {};
            var typeMap = {};
            $dataService.get('criteriaHierarchy?cbSprofileId='+ $scope.profile.cbSprofileId, function(permissions){
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
    /*
    ################################################################################
                            End of Geo Criteria
    ################################################################################
    */
   
    /*
    ################################################################################
                            Range Criteria
    ################################################################################
    */

        

        function criteriaRange(attributeMap){
            $dataService.get('criteriaRanges?cbSprofileId=' + $scope.profile.cbSprofileId,function(permissions){
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
                            Initialization
    ################################################################################
    */
		function fetchHomeDistrictHierarchy() {
			$scope.quickPickTypes = [
				{'id': 'county',    'prefix': '', 'suffix': ' County', 'caption': 'County', 'field': 'quickCounty', 'relatedHierarchyId': $scope.homeDistrict.countyId},
				{'id': 'iu',        'prefix': 'IU ', 'suffix': '', 'caption': 'IU 23', 'field': 'quickIU', 'relatedHierarchyId': $scope.homeDistrict.iuId},
				{'id': 'region',    'prefix': '', 'suffix': ' Region', 'caption': 'Region', 'field': 'quickRegion', 'relatedHierarchyId': $scope.homeDistrict.regionId},
				{'id': 'cluster',   'prefix': 'Cluster: ', 'suffix': '', 'caption': 'Cluster', 'field': 'quickCluster', 'relatedHierarchyId': $scope.homeDistrict.clusterId},
				{'id': 'cdestrict', 'prefix': '', 'suffix': '', 'caption': 'Contiguous Districts', 'field': 'contiguousHierarchy'}
			];
			
			angular.forEach($scope.quickPickTypes,function(quickPickType){
				quickPickType.selected = $scope.profile[quickPickType.field];
			});
			
			var hierarchyIds = [];
			hierarchyIds.push($scope.homeDistrict.countyId);
			hierarchyIds.push($scope.homeDistrict.iuId);
			hierarchyIds.push($scope.homeDistrict.regionId);
			hierarchyIds.push($scope.homeDistrict.clusterId);
			
			$dataService.getFromCache('hierarchy?hierarchyId.in=' + hierarchyIds.join(","), function(hierarchys){
				angular.forEach(hierarchys, function(hierarchy){
					angular.forEach($scope.quickPickTypes,function(quickPickType){
						if (quickPickType.relatedHierarchyId != null && quickPickType.relatedHierarchyId == hierarchy.hierarchyId && hierarchy.hierarchyName != null && hierarchy.hierarchyName != "") {
							quickPickType.caption = hierarchy.hierarchyName;
							
							if (quickPickType.suffix != null && quickPickType.suffix != "" && quickPickType.caption.toLowerCase().indexOf(quickPickType.suffix.toLowerCase()) == -1) {
								quickPickType.caption = quickPickType.caption + quickPickType.suffix;
							}
							if (quickPickType.prefix != null && quickPickType.prefix != "" && quickPickType.caption.toLowerCase().indexOf(quickPickType.prefix.toLowerCase()) == -1) {
								quickPickType.caption = quickPickType.prefix + quickPickType.caption;
							}
						}
					});
				});
			});
		}
	
		function fetchHomeDistrict() {
			$dataService.getFromCache('CBSprofiles/' + $scope.profile.homeHierarchyId + '/homedata', function(homeDisctricts){
				$scope.homeDistrict = homeDisctricts == null || homeDisctricts.length == 0 ? {} : homeDisctricts[0];
				fetchHomeDistrictHierarchy();
				fetchConfigurationItems();
			});
		}
		
		function fetchConfigurationItems() {
			$dataService.getFromCache('lookups?lookupType.in=HierarchyTypes,SchoolTypes,RangeGroups', function(lookups){
				
                $scope.schoolTypes = [];
                $scope.types = [];
                $scope.rangeGroups = [];
				
				angular.forEach(lookups, function(lookup){
					if (lookup.lookupType == 'HierarchyTypes') {
						$scope.types.push(lookup);
					} else if (lookup.lookupType == 'SchoolTypes') {
						$scope.schoolTypes.push({'hierarchyId': lookup.lookupId, 'hierarchyName': lookup.lookupName});
					} else {
						$scope.rangeGroups.push(lookup);
					}
				});
				
				$scope.types.push({"lookupId":"schoolTypes", "lookupName": "School Types", "options": $scope.schoolTypes});
				
                populateHierarchyTypeOptions();
				
                populateRangeGroupAttributes();
				
				$loader.hide();
            });
		}
		
		function populateRangeGroupAttributes() {
			$dataService.getFromCache('attributes',function(attributes){
				attributes = attributes || {};
				
				var rangeGroupMap = {};
				angular.forEach($scope.rangeGroups,function(rangeGroup){
					rangeGroupMap[rangeGroup.lookupId] = rangeGroup; 
					rangeGroup.selected = false;
					rangeGroup.attributes = [];
				});
				
				var attributeMap = {};
				
				angular.forEach(attributes, function(attribute){
					attribute.homeValue = attribute.sourceLookup == null || attribute.sourceLookup == '' ? null : $scope.homeDistrict[attribute.sourceLookup.toLowerCase()];
					
					var rangeGroup = rangeGroupMap[attribute.attributeGroupId];
					if (rangeGroup != null) {
						rangeGroup.attributes.push(attribute);
					}
					
					attributeMap[attribute.attributeId] = attribute;
				});
				
				if ($scope.rangeGroups != null && $scope.rangeGroups.length > 0) {
					selectRangeGroup($scope.rangeGroups[0]);
				}
				
				criteriaRange(attributeMap);
			})
		}
		
		function populateHierarchyTypeOptions(){
			$dataService.getFromCache('hierarchy', function(hierarchies){
				hierarchies = hierarchies || [];
				
				var mapHierarchyType = {};
				angular.forEach($scope.types, function(type){
					type.options = type.options || [];
					mapHierarchyType[type.lookupId] = type
				});
				
				angular.forEach(hierarchies, function(hierarchy){
					var type = mapHierarchyType[hierarchy.hierarchyType];
					if (type != null) {
						type.options.push(hierarchy);
					}
				});
				
				criteriaHierarchy();
			});
		}
	
        function init(){
			$loader.show();
			
			$dataService.get('CBSprofiles/' + $routeParams.profileId, function(profiles) {
				$scope.profile = profiles == null || profiles.length == 0 ? {} : profiles[0];
				$recentProfile.set($scope.profile);
				$recentProfile.show($scope);
				
				fetchHomeDistrict();
			});         
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
			'url':'/views/CBS/profiles/edit/i_GeoCriteriaView',
            'selected':true
        },{
            'id':'quick-pick',
            'img':'/images/psea-assets/quick/quick.png',
            'imgSelected':'/images/psea-assets/quick-selected/shape.png',
            'caption':'Quick Pick',
			'url':'/views/CBS/profiles/edit/i_QuickTypesView',
            'selected':false
        },{
            'id':'range-criteria',
            'img':'/images/psea-assets/range/range.png',
            'imgSelected':'/images/psea-assets/range-selected/range-selected.png',
            'caption':'Range Criteria',
			'url':'/views/CBS/profiles/edit/i_RangeCriteriaView',
            'selected':false
        },{
            'id':'check-criteria',
            'img':'/images/psea-assets/check/check.png',
            'imgSelected':'/images/psea-assets/check-selected/shape.png',
            'caption':'Check Criteria',
			'url':'/views/CBS/profiles/edit/i_CheckCriteriaView',
            'selected':false
        }];

        

        function selectCriteria(criteria){
            angular.forEach($scope.master,function(criteria){
                criteria.selected = false;
            })
             criteria.selected = true;
             $scope.currentSelectedCriteria = criteria.id;
        }
		
		

        function showLink(link){
			angular.forEach($scope.links,function(link){
				link.selected = false;
			})
			link.selected = true;
        }
		
        init();
    }
]);





