var app = angular.module('cbs');

app.controller('cbs.reports.controller', ['$scope','$dataService','cbsCache',
function($scope,$dataService,$cbsCache) {

        function init(){
            //fetch the recent profile form cache
            $scope.recentProfile = $cbsCache.get('recentProfile');
            //fetch reportGroups first - there's only 1 group for now
            //Hence this will not be visible on front-end, but group GUID maybe required for PBI token generation
            $dataService.get('reportGroups',function(reportGroups){
                if(reportGroups != null){
                    $scope.reportGroups = reportGroups;
                }
            })
            
            //next fetch the reports, currently, 4 reports are expected
            //On UI these will appear as report groups
            $dataService.get('reports',function(reports){
                if(reports != null){
                    $scope.reports = reports;
                }
            })

            //lastly, fetch the reportTabs, currently, 26 are expected
            //On UI these will appear as 26 individual reports categories in 4 groups
            $dataService.get('reportTabs',function(reportTabs){
                if(reportTabs != null){
                    $scope.reportTabs = reportTabs;
                }
            })

        }

        init();
}]);