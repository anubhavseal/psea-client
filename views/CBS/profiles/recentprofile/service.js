'use strict';
angular.module('base')
	.factory('$recentProfile', ['$cache', '$moment', '$route', '$dataService',function($cache, $moment, $route, $dataService){
		return {
			get :getRecentProfile,
			set: setRecentProfile,
			show: showRecentProfile
		};
		
		function getRecentProfile() {
			return $cache.session.get("cbs", "recent.profile");
		}
		
		function setRecentProfile(profile, first) {
			if (profile != null) {
				profile.lastAccessedAt = new Date();
				$dataService.put('CBSprofiles?cbSprofileId='+ profile.cbSprofileId,profile, function(response){
				});
			}
			$cache.session.put("cbs", "recent.profile", profile);
		}
		
		function showRecentProfile($scope) {
			var routePath = null;
			try{
				routePath = $route.current.$$route.originalPath;
			}catch(e){
			}
			
			var mapRouteHeading = {
				'/profiles': 'Profiles',
				'/reports': 'Reports',
				'/profiles/:profileId': 'Criteria'
			};
			
			$scope.recentProfile = getRecentProfile();
			$scope.$moment = $moment;
			$scope.profileGreeting = $cache.session.get("cbs", "recent.profile.accessed") == null ? "Welcome Back" : (mapRouteHeading[routePath] || " ");
			$cache.session.put("cbs", "recent.profile.accessed", "true");
			$scope.profileLocation = routePath;
		}
	}]);