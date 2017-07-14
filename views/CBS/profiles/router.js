angular.module('cbs')
.config(['$routeProvider',function($routeProvider){
    $routeProvider
    .when('/profiles',{
        templateUrl:'/views/CBS/profiles/list/view',
        controller:'cbs.profileLists.controller'
    })
    .when('/details/:profileId/:homeDistrictId',{
        templateUrl:'/views/CBS/profiles/details/view',
        controller:'cbs.profileDetails.controller'
    });
}]);