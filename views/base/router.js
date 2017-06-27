'use strict';

angular.module('base').
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/list/:listName', {
				templateUrl: '/views/base/list/view',
				controller: 'base.list.controller',
				resolve: {
					'listConfigId': function(){
						return '';
					},
					'viewId': function(){
						return '';
					}
				}
			})
			.when('/dashboard', {
				templateUrl: '/views/base/dashboard/view',
				controller: 'base.dashboard.controller',
				resolve: {
					'dashboardConfigId': function($constants){
						return $constants.GlobalDashboardConfigId || '';
					}
				}
			})
			.when('/dashboard/:dashboardConfigId', {
				templateUrl: '/views/base/dashboard/view',
				controller: 'base.dashboard.controller',
				resolve: {
					'dashboardConfigId': function(){
						return '';
					}
				}
			});
			
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});
	}]);