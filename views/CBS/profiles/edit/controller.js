angular.module('cbs').controller('cbs.profiles.edit.controller',[
'$scope',
'$dataService',
'$routeParams',
'$loader',
'$recentProfile',
'$notifier',
'$popup',
function($scope, $dataService, $routeParams, $loader, $recentProfile, $notifier,$urlPath,$popup) {
	$scope.showLink = showLink;
	$scope.searchMap = {};
    $scope.getSelectedCount = getSelectedCount;
    $scope.selectType = selectType;
	$scope.deleteSearchText = deleteSearchText;
	$scope.getCriteriaHieracrhiesCount = getCriteriaHieracrhiesCount;
    $scope.selectRangeGroup = selectRangeGroup;
    $scope.getSelectedAttributesCount = getSelectedAttributesCount;
    $scope.updateRangeMaxValue = updateRangeMaxValue;
    $scope.updateRangeMinValue = updateRangeMinValue;
    $scope.changeMinimumPercentage = changeMinimumPercentage;
    $scope.changeMaximumPercentage = changeMaximumPercentage;

    $scope.applySelectedGeoOptions = applySelectedGeoOptions;
    $scope.applyRangeCriteria = applyRangeCriteria;
	$scope.updateSchoolType = updateSchoolType;
    $scope.selectCriteria = selectCriteria;
    $scope.currentSelectedCriteria = 'Geo-Criteria';
	$scope.getSelectedAttributeCount = getSelectedAttributeCount;
	$scope.getCriteriaRangesCount = getCriteriaRangesCount;
	
	$scope.updateQuickPicks = updateQuickPicks;
	$scope.getQuickPicksCount = getQuickPicksCount;

    $scope.clearAllQuickPick = clearAllQuickPick;
    $scope.clearAllRangeCriteria = clearAllRangeCriteria;
    $scope.clearAllGeoCriteria = clearAllGeoCriteria;
    $scope.clearAllCriteria = clearAllCriteria; 
    /*
    ################################################################################
                            Initialization
    ################################################################################
    */
	function init(){
		$loader.show();
		$dataService.get('CBSprofiles/' + $routeParams.profileId, function(profiles) {
			$scope.profile = profiles == null || profiles.length == 0 ? {} : profiles[0];
				$dataService.getFromCache('hierarchy?hierarchyId.in=' + $scope.profile.homeHierarchyId,function(hierarchies){
					$scope.profile.homeHierarchyName = hierarchies == null || hierarchies.length == 0 ? {} : hierarchies[0].hierarchyName;
					$recentProfile.set($scope.profile);
					$recentProfile.show($scope);
			})
			fetchHomeDistrict();
		});         
	}

	function fetchHomeDistrict() {
		$dataService.getFromCache('CBSprofiles/' + $scope.profile.homeHierarchyId + '/homedata', function(homeDisctricts){
			$scope.homeDistrict = homeDisctricts == null || homeDisctricts.length == 0 ? {} : homeDisctricts[0];
			fetchHomeDistrictHierarchy();
			fetchConfigurationItems();
		});
	}
	
	function fetchHomeDistrictHierarchy() {
		$scope.quickPickTypes = [
			{'id': 'countyId',  'prefix': '', 'suffix': ' County', 'caption': 'County', 'field': 'quickCounty', 'relatedHierarchyId': $scope.homeDistrict.countyId},
			{'id': 'iuId',      'prefix': 'IU ', 'suffix': '', 'caption': 'IU 23', 'field': 'quickIU', 'relatedHierarchyId': $scope.homeDistrict.iuId},
			{'id': 'regionId',  'prefix': '', 'suffix': ' Region', 'caption': 'Region', 'field': 'quickRegion', 'relatedHierarchyId': $scope.homeDistrict.regionId},
			{'id': 'clusterId', 'prefix': 'Cluster: ', 'suffix': '', 'caption': 'Cluster', 'field': 'quickCluster', 'relatedHierarchyId': $scope.homeDistrict.clusterId},
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

	function fetchConfigurationItems() {
		$dataService.getFromCache('lookups?lookupType.in=HierarchyTypes,SchoolTypes,RangeGroups', function(lookups){
			
			$scope.schoolTypes = [];
			$scope.types = [];
			$scope.rangeGroups = [];
			
			angular.forEach(lookups, function(lookup){
				if (lookup.lookupType == 'HierarchyTypes') {
					$scope.types.push(lookup);
				} else if (lookup.lookupType == 'SchoolTypes') {
					$scope.schoolTypes.push(lookup);
				} else {
					$scope.rangeGroups.push(lookup);
				}
			});
			
			populateHierarchyTypeOptions();
			populateRangeGroupAttributes();
			populateSchoolTypePermissions();
			
			$loader.hide();
		});
	}
    
    /*
    ################################################################################
                            End of Initialization
    ################################################################################
    */

     /*
    ################################################################################
                            Geo Criteria
    ################################################################################
    */
	function populateSchoolTypePermissions(callback){
		var schoolTypeMap = {};
		$dataService.get('criteriaSchoolType?cbSprofileId='+ $scope.profile.cbSprofileId, function(permissions){
			permissions = permissions || [];
			angular.forEach($scope.schoolTypes, function(schoolType){
				schoolType.selected = false;
				schoolType.originalySelected = false;
				schoolType.criteriaSchoolTypeId = null;
				schoolTypeMap[schoolType.lookupId] = schoolType;
			});

			angular.forEach(permissions, function(permission){
				var schoolType = schoolTypeMap[permission.schoolTypeId];
				if (schoolType != null) {
					schoolType.selected = true;
					schoolType.originalySelected = true;
					schoolType.criteriaSchoolTypeId = permission.criteriaSchoolTypeId;
				}

				if (callback) {
					callback();
				}
			});
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

			if ($scope.types != null && $scope.types.length > 0) {
				selectType($scope.types[0]);
			}
			
			populateHierarchyPermissions();
		});
	}

	function populateHierarchyPermissions(callback){
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
					option.originalySelected = false;
					option.criteriaHierarchyId = null;
					type.group2Count++;
				});
			});

			angular.forEach(permissions, function(permission){
				var option = optionMap[permission.hierarchyId];
				if (option != null) {
					option.group = 1;
					option.selected = true;
					option.originalySelected = true;
					option.criteriaHierarchyId = permission.criteriaHierarchyId;
					var type = typeMap[option.hierarchyType];
					type.group1Count++;
					type.group2Count--;
				}
			});

			if (callback) {
				callback();
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
		return selectedCount;
	}
	
	function getCriteriaHieracrhiesCount(type){
		var count = 0;
		if(type == null){
			angular.forEach($scope.types,function(type){
				angular.forEach(type.options,function(option){
					count = option.criteriaHierarchyId != null ? count = count + 1 : count;
				})
			})
		}else{
			angular.forEach(type.options,function(option){
				count = option.criteriaHierarchyId != null ? count = count + 1 : count;
			})
		}
		return count;
	}

	function deleteSearchText(type){
		if($scope.searchMap[type.lookupId])
			$scope.searchMap[type.lookupId].searchData = '';
	}

	function applySelectedGeoOptions(type){
		var data = [];
		var cbSprofileId = $scope.profile.cbSprofileId;
		var options = {'apiURL': 'criteriaHierarchy', 'primaryKeyField': 'criteriaHierarchyId', 'data': data};

		if(type == null){
			angular.forEach($scope.types,function(type){
				angular.forEach(type.options,function(option){
					if (option.selected && option.criteriaHierarchyId == null) {
						data.push({'cbSprofileId': cbSprofileId, 'hierarchyId': option.hierarchyId})
					} else if (!option.selected && option.criteriaHierarchyId != null){
						data.push({'__row_mode': 'D', 'criteriaHierarchyId': option.criteriaHierarchyId})
					}
				});
			})
		}else{
			angular.forEach(type.options,function(option){
				if (option.selected && option.criteriaHierarchyId == null) {
					data.push({'cbSprofileId': cbSprofileId, 'hierarchyId': option.hierarchyId})
				} else if (!option.selected && option.criteriaHierarchyId != null){
					data.push({'__row_mode': 'D', 'criteriaHierarchyId': option.criteriaHierarchyId})
				}
			});
		}
		

		$dataService.synchronize(options, function(results){
			
			var errorCount = 0;
			angular.forEach(results, function(result){
				if (result.status == 'E') {
					errorCount++;
				}
			});
			
			if (errorCount > 0) {
				$notifier.error('Error encountered.');
			} else {
				$notifier.success('Profile updated successfully.');
				populateHierarchyPermissions(function(){
					evaluateQualifyingDistricts();
				});
			}
		});
	}

	function updateSchoolType() {
		var data = [];
		var cbSprofileId = $scope.profile.cbSprofileId;
		var options = {'apiURL': 'criteriaSchoolType', 'primaryKeyField': 'criteriaSchoolTypeId', 'data': data};
		
		angular.forEach($scope.schoolTypes,function(option){
			if (option.selected && option.criteriaSchoolTypeId == null) {
				data.push({'cbSprofileId': cbSprofileId, 'schoolTypeId': option.lookupId})
			} else if (!option.selected && option.criteriaSchoolTypeId != null){
				data.push({'__row_mode': 'D', 'criteriaSchoolTypeId': option.criteriaSchoolTypeId})
			}
		});

		$dataService.synchronize(options, function(results){
			
			var errorCount = 0;
			angular.forEach(results, function(result){
				if (result.status == 'E') {
					errorCount++;
				}
			});
			
			if (errorCount > 0) {
				$notifier.error('Error encountered.');
			} else {
				$notifier.success('Profile updated successfully.');
				populateSchoolTypePermissions(function(){
					evaluateQualifyingDistricts();
				});
			}
		});
	}

	function clearAllGeoCriteria(){
		alertify.confirm("Are you sure you want to clear all Geo Criteria?",function (e) {
			if (e) {
				angular.forEach($scope.types,function(type){
					angular.forEach(type.options,function(option){
						option.selected = false;
					})
				})
				applySelectedGeoOptions();
			$scope.$apply();
			} 
		});  
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
    
    function populateRangeGroupAttributes() {
		$dataService.getFromCache('attributes',function(attributes){
			attributes = attributes || {};
			
			var rangeGroupMap = {};
			angular.forEach($scope.rangeGroups,function(rangeGroup){
				rangeGroupMap[rangeGroup.lookupId] = rangeGroup; 
				rangeGroup.selected = false;
				rangeGroup.attributes = [];
			});

			angular.forEach(attributes, function(attribute){
				var fieldName = attribute.sourceLookup == null || attribute.sourceLookup == '' ? '' : attribute.sourceLookup.toLowerCase();
				attribute.fieldName = fieldName.replace("*100", "");
				attribute.homeValue = $scope.homeDistrict[attribute.fieldName];
				
				var rangeGroup = rangeGroupMap[attribute.attributeGroupId];
				if (rangeGroup != null) {
					rangeGroup.attributes.push(attribute);
				}
			});
			
			if ($scope.rangeGroups != null && $scope.rangeGroups.length > 0) {
				selectRangeGroup($scope.rangeGroups[0]);
			}
			
			$scope.attributes = attributes;
			populateRangePermissions();
		})
	}

	function populateRangePermissions(callback){
		var attributeMap = {};
		angular.forEach($scope.attributes, function(attribute){
			attributeMap[attribute.attributeId] = attribute;
			attribute.minPercent = 3;
			attribute.maxPercent = 3;
			attribute.minValue = attribute.homeValue - (attribute.minPercent * attribute.homeValue) / 100;
			attribute.maxValue = attribute.homeValue + (attribute.maxPercent * attribute.homeValue) / 100;
			attribute.selected = false;
			attribute.criteriaRangeId = null;
			attribute.originalSelected = attribute.selected;
			attribute.originalMinValue = attribute.minValue;
			attribute.originalMaxValue = attribute.maxValue;
		});
		
		$dataService.get('criteriaRanges?cbSprofileId=' + $scope.profile.cbSprofileId,function(permissions){
			permissions = permissions || [];
			angular.forEach(permissions,function(permission){
				var attribute = attributeMap[permission.attributeId];
				if(attribute != null){
					attribute.minValue = permission.minValue;
					attribute.maxValue = permission.maxValue;
					attribute.minPercent = permission.minPercent;
					attribute.maxPercent = permission.maxPercent;
					attribute.selected = true;
					attribute.criteriaRangeId = permission.criteriaRangeId;
					attribute.originalSelected = attribute.selected;
					attribute.originalMinValue = attribute.minValue;
					attribute.originalMaxValue = attribute.maxValue;
				}
			});

			if (callback) {
				callback();
			}
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

	function getCriteriaRangesCount(rangeGroup){
		var count = 0;
		if(rangeGroup == null){
			angular.forEach($scope.rangeGroups,function(rangeGroup){
				angular.forEach(rangeGroup.attributes,function(attribute){
					count = attribute.criteriaRangeId != null ? count = count + 1 : count;
				})
			})
		}else{
			angular.forEach(rangeGroup.attributes,function(attribute){
				count = attribute.criteriaRangeId != null ? count = count + 1 : count;
			})
		}
		return count;
	}

	function updateRangeMaxValue(attribute){
		var maxValue = attribute.maxPercent === null || attribute.homeValue == null || attribute.homeValue == 0 ? null : (attribute.homeValue + (attribute.maxPercent*attribute.homeValue)/100);
		attribute.maxValue = maxValue;
	}

	function updateRangeMinValue(attribute){
		var minValue = attribute.minPercent === null || attribute.homeValue == null || attribute.homeValue == 0 ? null : (attribute.homeValue - (attribute.minPercent*attribute.homeValue)/100);
		attribute.minValue = minValue;
	}

	function changeMinimumPercentage(attribute){
		var minPercent = attribute.minValue === null || attribute.homeValue == null || attribute.homeValue == 0 ? null : (((attribute.homeValue - attribute.minValue)/attribute.homeValue)*100);
		attribute.minPercent = minPercent;
	}

	function changeMaximumPercentage(attribute){
		var maxPercent = attribute.minValue === null || attribute.homeValue == null || attribute.homeValue == 0 ? null : (((attribute.maxValue - attribute.homeValue)/attribute.homeValue)*100);
		attribute.maxPercent = maxPercent;
	}

	function getSelectedAttributeCount(rangeGroup) {
		var selected = 0;
		angular.forEach(rangeGroup.attributes, function(attribute){
			if (attribute.selected) {
				selected++;
			}
		})
		return selected;
	}

	function applyRangeCriteria(rangeGroup){
		var criteriaRanges = [];
		var cbSprofileId = $scope.profile.cbSprofileId;
		var options = {'apiURL': 'criteriaRanges', 'primaryKeyField': 'criteriaRangeId', 'data': criteriaRanges};

		if (rangeGroup == null) {
			angular.forEach($scope.rangeGroups,function(group){
				if (group.selected) {
					rangeGroup = group;
				}
			})
			angular.forEach(rangeGroup.attributes,function(attribute){
				if (attribute.selected && attribute.criteriaRangeId == null) {
					criteriaRanges.push({'cbSprofileId': cbSprofileId, 'attributeId': attribute.attributeId, 'minPercent': attribute.minPercent, 'maxPercent': attribute.maxPercent, 'minValue': attribute.minValue, 'maxValue': attribute.maxValue})
				} else if (!attribute.selected && attribute.criteriaRangeId != null){
					criteriaRanges.push({'__row_mode': 'D', 'criteriaRangeId': attribute.criteriaRangeId})
				}
			});
		}else{
			angular.forEach($scope.rangeGroups,function(rangeGroup){
				angular.forEach(rangeGroup.attributes,function(attribute){
					if (attribute.selected && attribute.criteriaRangeId == null) {
						criteriaRanges.push({'cbSprofileId': cbSprofileId, 'attributeId': attribute.attributeId, 'minPercent': attribute.minPercent, 'maxPercent': attribute.maxPercent, 'minValue': attribute.minValue, 'maxValue': attribute.maxValue})
					} else if (!attribute.selected && attribute.criteriaRangeId != null){
						criteriaRanges.push({'__row_mode': 'D', 'criteriaRangeId': attribute.criteriaRangeId})
					}
				});
			})
		 }
			
		
		$dataService.synchronize(options, function(results){
			
			var errorCount = 0;
			angular.forEach(results, function(result){
				if (result.status == 'E') {
					errorCount++;
				}
			});
			
			if (errorCount > 0) {
				$notifier.error('Error encountered.');
			} else {
				$notifier.success('Profile updated successfully.');
				populateRangePermissions(function(){
					evaluateQualifyingDistricts();
				});
			}
		});
	}

	function clearAllRangeCriteria(){
		alertify.confirm("Are you sure you want to clear all Range Criteria?",function (e) {
			if (e) {
				angular.forEach($scope.rangeGroups,function(rangeGroup){
					angular.forEach(rangeGroup.attributes,function(attribute){
						attribute.selected = false;
					})
				})
				applyRangeCriteria($scope.rangeGroups);
				$scope.$apply();
			} 
		});  
	}
    /*
    ################################################################################
                           End of Range Criteria
    ################################################################################
    */

	function clearAllCriteria(){
		alertify.confirm("Are you sure you want to clear All Criteria?",function (e) {
			if (e) {
				angular.forEach($scope.types,function(type){
					angular.forEach(type.options,function(option){
						option.selected = false;
					})
				})
				applySelectedGeoOptions();
				angular.forEach($scope.rangeGroups,function(rangeGroup){
					angular.forEach(rangeGroup.attributes,function(attribute){
						attribute.selected = false;
					})
				})
				applyRangeCriteria($scope.rangeGroups);
				angular.forEach($scope.quickPickTypes,function(quickPickType){
					quickPickType.selected = false;
				});
				updateQuickPicks()
				$scope.$apply();
			} 
		});
	}

	function updateQuickPicks() {
		var cbSprofileId = $scope.profile.cbSprofileId;
		var profile = {};
		
		angular.forEach($scope.quickPickTypes, function(quickPickType){
			profile[quickPickType.field] = quickPickType.selected;
		});
		
		$dataService.put('CBSprofiles/' + cbSprofileId, profile, function(response){
			$dataService.get('CBSprofiles/' + $routeParams.profileId, function(profiles) {
				$scope.profile = profiles == null || profiles.length == 0 ? {} : profiles[0];
			}); 
			$notifier.success('Profile updated successfully.');
			evaluateQualifyingDistricts();
		});

		
	}

	function clearAllQuickPick(quickPickType){
		alertify.confirm("Are you sure you want to clear all Quick Picks?",function (e) {
			if (e) {
				angular.forEach($scope.quickPickTypes,function(quickPickType){
					quickPickType.selected = false;
				});
				updateQuickPicks()
				$scope.$apply();
			} 
		});
	}

	function getQuickPicksCount(){
		var count = 0;
		for(key in $scope.profile){
			if($scope.profile.hasOwnProperty(key)){
				if(key == 'quickCluster' || key == 'quickRegion' || key == 'quickIU' || key == 'quickCounty'){
					count = $scope.profile[key] == true ? count = count + 1 : count;
				}
			}
		}
		return count;
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

	function evaluateQualifyingDistricts() {
		var typeFieldMap = {'CLSTR': 'clusterId', 'RGN': 'regionId', 'RGN': 'regionId', 'IU': 'iuId', 'CNTY': 'countyId', 'DSTRCT': 'districtId'};

		var selectedHierarchyIdMap = {};
		angular.forEach($scope.types, function(type){
			var key = typeFieldMap[type.lookupCode];
			var selectedHierarchyIds = [];
			angular.forEach(type.options, function(option){
				if (option.originalySelected && selectedHierarchyIds.indexOf(option.hierarchyId) == -1) {
					selectedHierarchyIds.push(option.hierarchyId);
				}
			});
			selectedHierarchyIdMap[key] = selectedHierarchyIds;
		});

		var contiguousDistrict = false;

		angular.forEach($scope.quickPickTypes, function(quickPickType){
			var selected = $scope.profile[quickPickType.field];
			var id = quickPickType.relatedHierarchyId;
			var selectedHierarchyIds = selectedHierarchyIdMap[quickPickType.id];
			if (selected && id != null && id != '' && selectedHierarchyIds != null && selectedHierarchyIds.indexOf(id) == -1) {
				selectedHierarchyIds.push(id);
			}
		});

		var schoolTypeIds = [];
		var schoolTypeField = "prstyp";
		var schoolTypeReferenceField = "lookupCode";
		angular.forEach($scope.schoolTypes, function(schoolType){
			if (schoolType.originalySelected && schoolTypeIds.indexOf(schoolType[schoolTypeReferenceField]) == -1) {
				schoolTypeIds.push(schoolType[schoolTypeReferenceField]);
			}
		});

		var selectedAttributes = [];
		angular.forEach($scope.attributes, function(attribute){
			if (attribute.originalSelected ) {
				selectedAttributes.push(attribute);
			}
		});

		$dataService.getFromCache('contiguousHierarchy?hierarchyId=' + $scope.homeDistrict.districtId, function(contiguousDistricts){
			var selectedDistrictIds = selectedHierarchyIdMap['districtId'];

			angular.forEach(contiguousDistricts, function(contiguousDistrict){
				if (contiguousDistrict.contiguousHierarchyId != null && selectedDistrictIds.indexOf(contiguousDistrict.contiguousHierarchyId) == -1) {
					selectedDistrictIds.push(contiguousDistrict.contiguousHierarchyId);
				}
			});

			$dataService.getFromCache('districts', function(districts){
				districts = districts || [];

				var qualifyingDistricts = [];
				angular.forEach(districts, function(district){
					var selected = false;

					angular.forEach(selectedHierarchyIdMap, function(selectedHierarchyIds, fieldName) {
						if (district[fieldName] != null && district[fieldName] != "" && selectedHierarchyIds.indexOf(district[fieldName]) >= 0) {
							selected = true;
						}
					});

					var schoolType = district[schoolTypeField] == 0 ? 'I' : (district[schoolTypeField] == 7 ? 'V' : 'B');

					if (schoolTypeIds.indexOf(schoolType) == -1) {
						selected = false;
					}

					angular.forEach(selectedAttributes, function(attribute){
						var value = district[attribute.fieldName];
						if (value != null && attribute.originalMinValue != null && attribute.originalMinValue > value) {
							selected = false;
						}
						if (value != null && attribute.originalMaxValue != null && attribute.originalMaxValue < value) {
							selected = false;
						}
					});

					if (selected) {
						qualifyingDistricts.push({'hierarchyId': district.districtId});
					}
				});

				$dataService.post('CBSprofiles/' + $routeParams.profileId + '/qualifyingDistricts', qualifyingDistricts, function(response){
					
				});
			});

		});
	}
	
	init();

}]);





