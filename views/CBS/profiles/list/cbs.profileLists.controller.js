var app = angular.module('cbs');

app.controller('cbs.profileLists.controller', ['$scope','$dataService',function($scope,$dataService) {
    $scope.createProfile = createProfile;
        function createProfile(){
            var profile = {
                "cbSprofileName": $scope.profileName,
                "ownerId": 505,
                "homeHierarchyId": $scope.homeDistrict,
                "eaespFlag": $scope.eaespFlag
            }
            $dataService.post('CBSprofiles',profile,function(response){
                
            })
        }
        function init(){
            $dataService.get('CBSprofiles',function(profiles){
                if(profiles != null){
                    $scope.profiles = profiles;
                }
            })
            $dataService.get('lookups?lookupId=525',function(hierarchy){
                $dataService.get('hierarchy?hierarchyType=525',function(districts){
                    if(hierarchy != null && districts != null){
                        $scope.districts = districts;
                    }
                })
            })
        }
        init();
}]);