angular.module('cbs').controller('cbs.controller',[
    '$scope',
    '$cache',
    '$recentProfile',
    '$navigation',
function($scope, $cache, $recentProfile, $navigation) {
    console.log('main')
    $scope.app = [{
		'id':'/profiles',
		'url':'Profiles',
		'display':true
	},{
		'id':'/profiles/a', //+ //$recentProfile.get().cbSprofileId,
		'url':'Criteria',
		'display':false
	},{
		'id':'range-criteria',
		'url':'Reports',
		'display':false
    }];
    $scope.shownav = function (v){
        angular.forEach($scope.app,function(link){
            link.display = false;
        })
        v.display = true;
        $scope.selectedTab = v;
        setNavigationStatus(v);
        console.log($scope.app)
    }
    function setNavigationStatus(selectedTab)  {
        $cache.put('psea', 'navStatus', selectedTab);
        $navigation.set(init);
    }

    function getNavigationStatus()  {
        return $cache.get('psea', 'navStatus');
    }
    $scope.t = 7;
    function init() {
        //debugger
        console.log('$scope.t = 7;',$scope.t);
        var selectedTab = getNavigationStatus();
        if(selectedTab != undefined)
            $scope.selectedTab = selectedTab;
        else
            $scope.selectedTab = $scope.app[0];
    }
    init();
}
])



