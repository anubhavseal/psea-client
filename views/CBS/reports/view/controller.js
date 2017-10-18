angular.module('cbs').controller('cbs.reports.view.controller', ['$scope','$dataService','$constants','$location','$routeParams','$notifier', '$recentProfile', '$timeout', function($scope,$dataService,$constants,$location, $routeParams, $notifier ,$recentProfile, $timeout) {
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
		var districts = getSelectedDistricts();
		if (districts.length == 0) {
			$notifier.error('Please select district(s) for report.');
			return;
		}
		
		var report = {};
		angular.forEach($scope.actualReport, function(value, key){
			report[key] = value;
		});
		var filters = [
			{
				"$schema": "http://powerbi.com/product/schema#basic",
				"target": {
					table: "ALLDISTRICTS",
					column: "DISTCODE"
				},
				"operator": "In",
				"values": districts
			}
		];
		
		if ($scope.homeDistrict != null) {
			filters.push({
				"$schema": "http://powerbi.com/product/schema#basic",
				"target": {
					table: "HOMEDISTRICT",
					column: "DISTCODE"
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

	

	function init(){
		$recentProfile.show($scope);

		$recentProfile.fetchQualifyingDistricts(function(districts, homeDistrict){
			$scope.districts = districts;
			$scope.homeDistrict = homeDistrict;
			
			if(districts == null || districts.length == 0){
				$notifier.error('District not available for selected profile. Please select appropriate profile.');
				$location.path('/profiles');
				return;
			}
		
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