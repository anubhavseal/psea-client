var app = angular.module('cbs');

app.controller('cbs.profileLists.controller', [
'$scope',
'$dataService',
'$accessService',
'cbsCache',
'$modal',
function($scope,$dataService,$accessService,$cbsCache,$modal) {
    $scope.changeProfile = changeProfile;
    $scope.modalInstance = modalInstance;

        //Before Going to any other route cache the clicked profile object 
        //and the index at which it was stored in the profiles Array
        function changeProfile(profile){
            $cbsCache.put('homeDistrictId',profile.homeHierarchyId);
            $cbsCache.put('recentProfile',profile)
            $cbsCache.put('id',profile.cbSprofileId);
        }

        function init(){

            //get current logged in user
            var activeUser = $accessService.getActiveUser();
            var ownerId = activeUser.userId;
            //fetch all profiles under current logged in user
            $dataService.get('CBSprofiles?ownerId='+ ownerId,function(profiles){
                if(profiles.length != 0){
                    $scope.profiles = profiles;
                    //fetch from cache the most recent profile
                    //and the index at which it was stored in profiles Array
                    var recentProfile = $cbsCache.get('recentProfile');
                    if(recentProfile){
                        $scope.recentProfile = recentProfile;
                        $scope.id = $cbsCache.get('id');
                        //console.log($scope.index);
                    }else{
                        $scope.recentProfile = $scope.profiles[0];
                        $scope.id = $scope.profiles[0].cbSprofileId;
                    }
                }
            })
            
        }

         function modalInstance(){
            $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/views/CBS/createProfile/createProfileView',
                controller: 'cbs.createProfile.controller',
                size: 'lg',
            });
         } 

        init();
}]);

app.factory('cbsCache',function($cacheFactory){
    return $cacheFactory('cbsCache');
})