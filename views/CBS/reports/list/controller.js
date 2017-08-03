angular.module('cbs')
.controller('cbs.reports.list.controller', [ '$scope', '$dataService', '$routeParams', '$recentProfile', function($scope,$dataService,$routeParams,$recentProfile,$urlPath) {
		
		function fetchReportTabs() {
			$dataService.get('reportTabs',function(reportTabs){
				reportTabs = reportTabs || [];
				var reportMap = {};
				angular.forEach($scope.reports, function(report){
					reportMap[report.reportId] = report;
					report.reportTabs = [];
				});
				
				angular.forEach(reportTabs, function(reportTab){
					var report = reportMap[reportTab.reportId];
					if (report != null) {
						report.reportTabs.push(reportTab);
					}
				});
            })
		}
		
		function fetchReports() {
			$dataService.get('reports',function(reports){
				$scope.reports = reports || [];

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
				
				//fetchReportTabs();
            })
		}

        function init(){
            //fetch the recent profile form cache
            $recentProfile.show($scope);
            //fetch reportGroups first - there's only 1 group for now
            //Hence this will not be visible on front-end, but group GUID maybe required for PBI token generation
            $dataService.get('reportGroups',function(reportGroups){
				reportGroups = reportGroups || [];
				$scope.reportGroups = reportGroups;
				
				fetchReports();
            });
        }

        init();
}]);