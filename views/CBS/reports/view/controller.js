angular.module('cbs').controller('cbs.reports.view.controller', ['$scope','$dataService','$routeParams', '$recentProfile', '$timeout', function($scope,$dataService, $routeParams, $recentProfile, $timeout) {
	$scope.updateSelectCount = updateSelectCount;
	$scope.applySelectedDistricts = applySelectedDistricts;
	$scope.districts = [];
	$scope.reports = [null]

	function updateSelectCount() {
		$scope.selectedDistrictCount = getSelectedDistricts().length;
	}

	function getSelectedDistricts() {
		var districts = [];
		angular.forEach($scope.districts, function(district){
			if (district.selected) {
				districts.push(district.districtId);
			}
		});
		return districts;
	}

	function applySelectedDistricts() {
		var report = {};
		angular.forEach($scope.actualReport, function(value, key){
			report[key] = value;
		});
		var filters = [
			{
				"$schema": "http://powerbi.com/product/schema#basic",
				"target": {
					table: "Districts",
					column: "DistId"
				},
				"operator": "In",
				"values": getSelectedDistricts()
			}
		];
		
		if ($scope.homeDistrict != null) {
			filters.push({
				"$schema": "http://powerbi.com/product/schema#basic",
				"target": {
					table: "HomeDistricts",
					column: "DistId"
				},
				"operator": "In",
				"values": [$scope.homeDistrict.districtCode]
			});
		}
		
		report.options = {
			"tokenType": 1,
			type: 'report',
			settings: {
				filterPaneEnabled: false,
				navContentPaneEnabled: true
			},
			filters: filters
		};
		$scope.reports = [report];
	}

	function fetchQualifyingDistricts(callback) {
		$dataService.get('CBSprofiles/' + $recentProfile.get().cbSprofileId + '/qualifyingDistricts', function(qualifyingDistricts){
			qualifyingDistricts = qualifyingDistricts || [];
			var homeDistrictId = $recentProfile.get().homeHierarchyId;
			var homeDistrict = null;
			$dataService.getFromCache('districts', function(districts){
				districts = districts || [];
				
				var selectedDistrictIds = [];
				var selectedDistricts = [];
				
				angular.forEach(qualifyingDistricts, function(qualifyingDistrict) {
					selectedDistrictIds.push(qualifyingDistrict.hierarchyId);
				});

				angular.forEach(districts, function(district) {
					if (homeDistrictId == district.districtId) {
						homeDistrict = district;
					}
					if (selectedDistrictIds.indexOf(district.districtId) > -1){
						selectedDistricts.push({'districtId': district.districtCode, 'districtName': district.districtName, 'selected': true});
					}
				});

				$scope.districts = selectedDistricts;
				$scope.homeDistrict = homeDistrict;

				callback();
			});
		});
	}

	function init(){
		$recentProfile.show($scope);

		fetchQualifyingDistricts(function(){
			updateSelectCount();
			$dataService.get('reports/' + $routeParams.reportId + '/token', function(report){
				report = report || {};
				$scope.actualReport = report;
				applySelectedDistricts();
			});
		});

		//Following code is always asking for report token from the API
		//It is also assuming hard-coded reportId = 1
		//This code needs to be refined to
		// (1). get the reportId from routeParams and
		// (2). check if valid token is already available in the $scope.reports object 
		//If yes, use the report token from there
		//Else, the code below will provide a new token
		
		//Once we get the token, rest should be all view
		//Report needs to be rendered in an iFrame
		//Not sure if anything more is required here
		
	}

	init();
}]);