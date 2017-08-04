angular.module('cbs')
.controller('cbs.reports.list.controller', [ '$scope', '$dataService', '$routeParams', '$recentProfile', function($scope,$dataService,$routeParams,$recentProfile,$urlPath) {
		
		
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
			console.log(new Date().getTime() + ": fetchReports");
			$dataService.get('reports',function(reports){
				$scope.reports = reports || [];
				callback();
			});
		}
		
		function fetchReportGroups(callback) {
			console.log(new Date().getTime() + ": fetchReportGroups");
			$dataService.get('reportGroups',function(reportGroups){
				$scope.reportGroups = reportGroups || [];
				callback();
			});
		}
		
		function mapReportsToReportGroup() {
			console.log(new Date().getTime() + ": mapReportsToReportGroup");
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
			async.parallel([fetchReports, fetchReportGroups], mapReportsToReportGroup);
        }

        init();
}]);