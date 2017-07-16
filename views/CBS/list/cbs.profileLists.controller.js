var app = angular.module('cbs');

app.controller('cbs.profileLists.controller', ['$scope',
'$dataService',
'$accessService',
'cbsCache',
function($scope,$dataService,$accessService,$cbsCache) {
    $scope.createProfile = createProfile;
    $scope.changeProfile = changeProfile;

        //Before Going to any other route cache the clicked profile object 
        //and the index at which it was stored in the profiles Array
        function changeProfile(profile){
            $cbsCache.put('homeDistrictId',profile.homeHierarchyId);
            $cbsCache.put('recentProfile',profile)
            $cbsCache.put('index',$scope.profiles.indexOf(profile));
            // console.log($scope.profiles);
            // console.log(profile)
            // console.log('first'+$cbsCache.get('index'))
        }

        function init(){

            //get current logged in user
            var activeUser = $accessService.getActiveUser();
            var ownerId = activeUser.userId;
            
            //fetch all profiles under current logged in user
            $dataService.get('CBSprofiles?ownerId='+ ownerId,function(profiles){
                if(profiles != null){
                    $scope.profiles = profiles;
                    //fetch from cache the most recent profile
                    //and the index at which it was stored in profiles Array
                    var recentProfile = $cbsCache.get('recentProfile');
                    if(recentProfile){
                        $scope.recentProfile = recentProfile;
                        $scope.index = $cbsCache.get('index');
                        console.log($scope.index);
                    }else{
                        $scope.recentProfile = $scope.profiles[0];
                        $scope.index = 0;
                    }
                }
            })
            
            //fetch all districts to populate the dropdown for selecting Home District
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