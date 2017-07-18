var app = angular.module('cbs');

app.controller('cbs.createProfile.controller',[
'$scope',
'$accessService',
'$dataService',
'$modalInstance',
function($scope,$accessService,$dataService,$modalInstance){
    $scope.createProfile = createProfile;
    function init(){
        $dataService.getFromCache('hierarchy?hierarchyType=525',function(districts){
            if(districts != null){
                $scope.districts = districts;
            }
        })
    }
    function createProfile(){
            var activeUser = $accessService.getActiveUser();
            var ownerId = activeUser.userId;
        profile={
            'ownerId':ownerId,
            'cbSprofileName':profileName,
            'homeHierarchyId':homeDistrict,
            'eaespFlag':eaespFlag,
        }
         $dataService.post('CBSprofiles',profile,function(response){
             console.log(response);
         });
    }
   
    init();
}]);