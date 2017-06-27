'use strict';
var app = angular.module('cloudApp', [
	'ngRoute',
	'ngSanitize'
]);

app.config(['$routeProvider',function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: '../views/route-test.html',
			controller: 'navClickedCtrl'
		})
		.when('/:ISVId', {
			templateUrl: '../views/route-test.html',
			controller: 'navClickedCtrl'
		})
		.when('/:ISVId/:testDriveId', {
			templateUrl: '../views/test-route-index.html',
			controller: 'launchCtrl'
		})
		.otherwise({redirectTo: '/'});

}]);

app.controller('navClickedCtrl', function($scope, $http, $routeParams){
    $scope.selected = 0;
    $scope.select= function(index, event) {
        $scope.selected = index;
        var isvID = index+1;
        var elemID = (event.target.id);
 	    $http.get("http://localhost:3001/api/isv/"+elemID)
	    	.success(function(isvDetails) {
	    		$scope.isvDetailList = isvDetails;
	    	});       
	    $http.get("http://localhost:3001/api/isv/"+elemID+"/testDrive")
	    	.success(function(response) {
	    		$scope.listing = response;
	    	});

	    // $http.get("http://localhost:3001/api/isv/"+$routeParams.ISVId+"/testDrive/"+elemID)
	    // 	.success(function(itemsList) {
	    // 		$scope.items = itemsList;
	    // 	});
    	console.log(event.target);
    };
});

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
    console.log(vars);
}

app.controller('launchCtrl', function($scope, $http, $routeParams) {
	var myParamISV = getUrlVars()['isvid'];
	var myParamTDI = getUrlVars()['testdriveid'];
    $http.get("http://localhost:3001/api/isv/"+myParamISV)
    	.success(function(isvDetails) {
    		$scope.isvDetailList = isvDetails;
    	});
    $http.get("http://localhost:3001/api/isv/"+myParamISV+"/testDrive/"+myParamTDI)// (isv/{{ISVID}}/testDrive/{{testDriveId}})
    	.success(function(response) {
    		$scope.listing = response;
    	});
});

app.controller('defaultCtrl', function($scope, $http) {
    $scope.selected = 0;
    $scope.select= function(index) {
        $scope.selected = index;
    };
    $http.get("http://localhost:3001/api/isv")
    	.success(function(data) {
			$scope.names = data;
		});

    $http.get("http://localhost:3001/api/isv/2")
    	.success(function(isvDetails) {
    		$scope.isvDetailList = isvDetails;
    	});
    $http.get("http://localhost:3001/api/isv/2/testDrive")
    	.success(function(response) {
    		$scope.listing = response;
    	});

    //http://192.168.1.109:3001/api/testDriveInstance
});
app.filter('nospace', function () {
    return function (value) {
        return (!value) ? '' : value.replace(/ /g, '');
    };
});
app.filter('html', ['$sce', function ($sce) { 
    return function (text) {
        return $sce.trustAsHtml(text);
    };    
}])