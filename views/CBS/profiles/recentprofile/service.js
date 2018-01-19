'use strict';
angular.module('base')
	.factory('$recentProfile', ['$cache', '$moment', '$route', '$dataService',function($cache, $moment, $route, $dataService){
		return {
			get :getRecentProfile,
			set: setRecentProfile,
			show: showRecentProfile,
			fetchQualifyingDistricts: fetchQualifyingDistricts
		};
		
		function getRecentProfile() {
			return $cache.session.get("cbs", "recent.profile");
		}
		
		function setRecentProfile(profile, first) {
			if (profile != null) {
				profile.lastAccessedAt = new Date();
				//$dataService.put('CBSprofiles?cbSprofileId='+ profile.cbSprofileId,profile, function(response){
					
				//});
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
		
		function fetchQualifyingDistricts(callback) {
			var profile = getRecentProfile();
			
			if (profile == null || profile.cbSprofileId == null || profile.cbSprofileId == 0) {
				callback(null, null);
				return;
			}
			
			$dataService.get('CBSprofiles/' + profile.cbSprofileId + '/qualifyingDistricts', function(qualifyingDistricts){
				qualifyingDistricts = qualifyingDistricts || [];
				var homeDistrictId = profile.homeHierarchyId;
				var homeDistrict = null;
				$dataService.getFromCache('districts', function(districts){
					districts = districts || [];
					
					var selectedDistrictIds = [];
					var selectedDistricts = [];
					
					angular.forEach(qualifyingDistricts, function(qualifyingDistrict) {
						selectedDistrictIds.push(qualifyingDistrict.hierarchyId);
					});

					angular.forEach(districts, function(district) {
						if (homeDistrictId == district.districtId) {
							homeDistrict = district;
						}
						if (selectedDistrictIds.indexOf(district.districtId) > -1){
							selectedDistricts.push({'districtId': district.districtCode, 'districtName': district.districtName, 'selected': true});
						}
					});

					callback(selectedDistricts, homeDistrict);
				});
			});
		}
	}]);