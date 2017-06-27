angular.module('security').
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/changepassword', {
			templateUrl: '/views/security/changepassword/view',
			controller: 'security.changepassword.controller'
		})
		.when('/security/changepassword', {
			templateUrl: '/views/security/changepassword/view',
			controller: 'security.changepassword.controller'
		})
		.when('/selecttenant', {
			templateUrl: '/views/security/selecttenant/view',
			controller: 'security.selecttenant.controller'
		})
		.when('/administration', {
			templateUrl: '/views/security/menu/childMenuView',
			controller: 'security.childmenu.controller',
			resolve: {
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/administration')();
				},
				'parentFunctionCode': function(){
					return 'Administration';
				},
				'parentFunctionId': function(){
					return null;
				}
			}
		})
		.when('/security', {
			redirectTo: '/administration'
		})
		.when('/administration/lookups', {
			templateUrl: '/views/base/list/view',
			controller: 'base.list.controller',
			resolve: {
				'listConfigId': function(){
					return 'lookupConfigs';
				},
				'viewId': function(){
					return '';
				}
			}
		})
		.when('/security/acceptagreement', {
			templateUrl: '/views/security/acceptagreement/view',
			controller: 'security.acceptagreement.controller'
		})
		.when('/acceptagreement', {
			templateUrl: '/views/security/acceptagreement/view',
			controller: 'security.acceptagreement.controller'
		})
		.when('/security/profiles', {
			templateUrl: '/views/base/list/view',
			controller: 'base.list.controller',
			resolve: {
				'listConfigId': function(){
					return 'profiles';
				},
				'viewId': function(){
					return 'default';
				},
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/profiles')();
				}
			}
		})
		.when('/security/profiles/:profileId', {
			templateUrl: '/views/security/profile/view',
			controller: 'security.profile.controller',
			 resolve: {
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/profiles')();
				},
				'tenantSpecific': function(){
					return true;
				}
			}
		})
		.when('/security/globalprofiles', {
			templateUrl: '/views/base/list/view',
			controller: 'base.list.controller',
			resolve: {
				'listConfigId': function(){
					return 'profiles';
				},
				'viewId': function(){
					return 'global';
				},
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/globalprofiles')();
				}
			}
		})
		.when('/security/globalprofiles/:profileId', {
			templateUrl: '/views/security/profile/view',
			controller: 'security.profile.controller',
			 resolve: {
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/globalprofiles')();
				},
				'tenantSpecific': function(){
					return false;
				}
			}
		})
		.when('/security/allprofiles', {
			templateUrl: '/views/base/list/view',
			controller: 'base.list.controller',
			resolve: {
				'listConfigId': function(){
					return 'profiles';
				},
				'viewId': function(){
					return 'allprofiles';
				},
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/allprofiles')();
				}
			}
		})
		.when('/security/allprofiles/:profileId', {
			templateUrl: '/views/security/profile/view',
			controller: 'security.profile.controller',
			 resolve: {
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/allprofiles')();
				},
				'tenantSpecific': function(){
					return "both";
				}
			}
		})
		.when('/security/users', {
			templateUrl: '/views/base/list/view',
			controller: 'base.list.controller',
			resolve: {
				'listConfigId': function(){
					return 'users';
				},
				'viewId': function(){
					return 'default';
				},
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/users')();
				}
			}
		})
		.when('/security/users/:userId', {
			templateUrl: '/views/security/signup/view',
			controller: 'security.signup.controller',
			resolve: {
				'availableTypes': function(){
					return ['N', 'S', 'A'];
				},
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/users')();
				}
			}
		})
		.when('/security/vendors', {
			templateUrl: '/views/base/list/view',
			controller: 'base.list.controller',
			resolve: {
				'listConfigId': function(){
					return 'users';
				},
				'viewId': function(){
					return 'vendors';
				},
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/vendors')();
				}
			}
		})
		.when('/security/vendors/:userId', {
			templateUrl: '/views/security/signup/view',
			controller: 'security.signup.controller',
			resolve: {
				'availableTypes': function(){
					return ['V'];
				},
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/vendors')();
				}
			}
		})
		.when('/security/allusers', {
			templateUrl: '/views/base/list/view',
			controller: 'base.list.controller',
			resolve: {
				'listConfigId': function(){
					return 'users';
				},
				'viewId': function(){
					return 'allusers';
				},
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/allusers')();
				}
			}
		})
		.when('/security/allusers/:userId', {
			templateUrl: '/views/security/signup/view',
			controller: 'security.signup.controller',
			resolve: {
				'availableTypes': function(){
					return ['V', 'N', 'S', 'A'];
				},
				'accessible': function($accessService){
					return $accessService.checkAccessiblity('/security/allusers')();
				}
			}
		})
		.when('/security/login', {
			templateUrl: '/views/security/login/View',
			controller: 'security.login.controller'
		});

	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);