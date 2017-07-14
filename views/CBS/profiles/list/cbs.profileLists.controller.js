var app = angular.module('cbs');

app.controller('cbs.profileLists.controller', ['$scope',
'$dataService',
'$accessService',
'cbsCache',
function($scope,$dataService,$accessService,$cbsCache) {
    $scope.createProfile = createProfile;
    $scope.changeProfile = changeProfile;

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

        function changeProfile(profile){
            $cbsCache.put('homeDistrictId',profile.homeHierarchyId);
            $scope.recentProfile = profile;
        }

        function init(){

            //get current logged in user
            var activeUser = $accessService.getActiveUser();
            var ownerId = activeUser.userId;
            
            //fetch all profiles under current logged in user
            $dataService.get('CBSprofiles?ownerId='+ ownerId,function(profiles){
                if(profiles != null){
                    $scope.profiles = profiles;
                    $scope.recentProfile = profiles[0];
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

app.factory('cbsCache',function($cacheFactory){
    return $cacheFactory('cbsCache');
})