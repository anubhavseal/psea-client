angular.module('cbs').controller('cbs.reports.view.controller', ['$scope','$dataService','$routeParams', '$recentProfile', '$timeout', function($scope,$dataService, $routeParams, $recentProfile, $timeout) {
	$scope.updateSelectCount = updateSelectCount;
	$scope.applySelectedDistricts = applySelectedDistricts;
	$scope.districts = [
		{'districtId': 1, 'districtName': 'ALBERT GALLATIN AREA', 'selected': true},
		{'districtId': 2, 'districtName': 'BROWNSVILLE AREA', 'selected': false}
	];
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
		report.options = {
			"tokenType": 1,
			type: 'report',
			settings: {
				filterPaneEnabled: false,
				navContentPaneEnabled: true
			},
			filters: [
				{
					"$schema": "http://powerbi.com/product/schema#basic",
					"target": {
						table: "District",
						column: "DISTID"
					},
					"operator": "In",
					"values": getSelectedDistricts()
				}
			]
		};
		$scope.reports = [report];
	}

	function init(){
		$recentProfile.show($scope);
		$scope.profileId = $routeParams.profileId;
		//Following code is always asking for report token from the API
		//It is also assuming hard-coded reportId = 1
		//This code needs to be refined to
		// (1). get the reportId from routeParams and
		// (2). check if valid token is already available in the $scope.reports object 
		//If yes, use the report token from there
		//Else, the code below will provide a new token
		
		updateSelectCount();
		$dataService.get('reports/' + $routeParams.reportId + '/token', function(report){
			report = report || {};
			$scope.actualReport = report;
			applySelectedDistricts();
		});
		
		//Once we get the token, rest should be all view
		//Report needs to be rendered in an iFrame
		//Not sure if anything more is required here
		
	}

	init();
}]);