angular.module('cbs').controller('cbs.reports.view.controller', ['$scope','$dataService','$routeParams', '$recentProfile', function($scope,$dataService, $routeParams, $recentProfile) {

        function init(){
			$recentProfile.show($scope);
            //Following code is always asking for report token from the API
            //It is also assuming hard-coded reportId = 1
            //This code needs to be refined to
            // (1). get the reportId from routeParams and
            // (2). check if valid token is already available in the $scope.reports object 
            //If yes, use the report token from there
            //Else, the code below will provide a new token
            $dataService.get('reports/' + $routeParams.reportId + '/token', function(report){
                if(report != null){
					report.options = {
						"tokenType": 1,
						type: 'report',
						settings: {
							filterPaneEnabled: false,
							navContentPaneEnabled: false
						}
					};
                    $scope.report = report;
                    $scope.report.IEmbedConfiguration = {};
                }
            })
			
            //Once we get the token, rest should be all view
            //Report needs to be rendered in an iFrame
            //Not sure if anything more is required here

        }

        init();
}]);