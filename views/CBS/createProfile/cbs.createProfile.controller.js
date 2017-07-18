var app = angular.module('cbs');

app.controller('cbs.createProfile.controller',[
'$scope',
'$dataService',
'$modalInstance',
function($scope,$dataService,$modalInstance){
    function init(){
        $dataService.get('hierarchy?hierarchyType=525',function(districts){
            if(districts != null){
                $scope.districts = districts;
            }
        })
    }
    init();
}]);