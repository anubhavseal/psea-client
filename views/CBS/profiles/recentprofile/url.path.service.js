'use strict;'

angular.module('base')
    .factory('$urlPath',['$location',function($location){
    return{
        get:getLocation
    };
    function getLocation($scope){
        var path =  $location.path().split("/");
        var pathName = path[path.length - 1];
        $scope.pathName = pathName;
    }
}]);