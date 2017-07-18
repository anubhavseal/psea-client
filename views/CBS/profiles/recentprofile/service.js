'use strict';
angular.module('base')
	.factory('$recentProfile', ['$cache', '$moment', function($cache, $moment){
		return {
			get :getRecentProfile,
			set: setRecentProfile,
			show: showRecentProfile
		};
		
		function getRecentProfile() {
			return $cache.session.get("cbs", "recent.profile");
		}
		
		function setRecentProfile(profile) {
			if (profile != null) {
				profile.lastAccessedOn = new Date();
			}
			$cache.session.put("cbs", "recent.profile", profile);
		}
		
		function showRecentProfile($scope) {
			$scope.recentProfile = getRecentProfile();
			$scope.$moment = $moment;
		}
	}]);