angular.module('cbs')
.controller('cbs.reports.list.controller', [ '$scope', '$dataService', '$routeParams', '$recentProfile', '$notifier', '$location', function($scope, $dataService, $routeParams, $recentProfile, $notifier, $location) {
		/*function fetchReportTabs(callback) {
			$dataService.get('reportTabs',function(reportTabs){
				$scope.reportTabs = reportTabs || [];
				callback();
            })
		}
		
		function mapReportTabToReports() {
			var reportMap = {};
			angular.forEach($scope.reports, function(report){
				reportMap[report.reportId] = report;
				report.reportTabs = [];
			});
			
			angular.forEach($scope.reportTabs, function(reportTab){
				var report = reportMap[reportTab.reportId];
				if (report != null) {
					report.reportTabs.push(reportTab);
				}
			});
		}*/
		
		function fetchReports(callback) {
			$dataService.get('reports',function(reports){
				$scope.reports = reports || [];
				callback();
			});
		}
		
		function fetchReportGroups(callback) {
			$dataService.get('reportGroups',function(reportGroups){
				$scope.reportGroups = reportGroups || [];
				callback();
			});
		}
		
		function mapReportsToReportGroup() {
			var reportGroupMap = {};

			angular.forEach($scope.reportGroups, function(reportGroup){
				reportGroupMap[reportGroup.reportGroupId] = reportGroup;
				reportGroup.reports = [];
			});

			angular.forEach($scope.reports, function(report){
				var reportGroup = reportGroupMap[report.reportGroupId];
				if (reportGroup != null) {
					reportGroup.reports.push(report);
				}
			});
		}

        function init(){
            $recentProfile.show($scope);
			$recentProfile.fetchQualifyingDistricts(function(districts, homeDistrict){
				$scope.isReportAvailable = districts != null && districts.length > 0;
				
				if(districts == null || districts.length == 0){
					$notifier.error('District(s) not available for selected profile. Please select appropriate profile.');
					$location.path('/profiles');
					return;
				}
				
				async.parallel([fetchReports, fetchReportGroups], mapReportsToReportGroup);
			});
        }

        init();
}]);