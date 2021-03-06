angular.module('security')
	.controller('security.login.controller', ['$scope', '$http', '$constants', '$loader', '$window', '$notifier', '$modal', '$cache', '$dataService', '$accessService', '$rootScope', 'adalAuthenticationService', 
		function ($scope, $http, $constants, $loader, $window, $notifier, $modal, $cache, $dataService, $accessService, $rootScope, adalService) {
			$scope.credentials = {};
			$scope.authenticate = authenticate;
			$scope.forgotPassword = forgotPassword;
			$scope.authWith = authWith;
			$scope.authConfigs = {};
			
			function init() {
				$scope.SupportedAuthentications = [];;
				$scope.dbAuthSupported = false;
				
				var authConfigs = {};
				angular.forEach($constants.SupportedAuthentications || [], function(authType) {
					authConfigs[authType.type.toUpperCase()] = authType;
					if (authType.type != null && (authType.type.toUpperCase() == 'DB' || authType.type.toUpperCase() == 'DATABASE')) {
						$scope.dbAuthSupported = true;
					} else {
						$scope.SupportedAuthentications.push(authType);
					}
				});
				
				$scope.authConfigs = authConfigs;
				
				if (!$scope.dbAuthSupported && $scope.SupportedAuthentications.length == 0) {
					$scope.dbAuthSupported = true;
				}
				
				var alreadyAuthWith = isAlreadyAuthenticated();
				
				var token = $cache.get('security', 'token') || $cache.session.get('security', 'token');
				var user = $cache.get('security', 'user') || $cache.session.get('security', 'user');
				if (token != null && user != null && token != '' && user.userId != '' && user.userId != null ) {
					if ($cache.session.get('security', 'token') == null || $cache.session.get('security', 'token') == '') {
						$cache.session.put('security', 'token', $cache.get('security', 'token'));
					}
					if ($cache.session.get('security', 'user') == null || $cache.session.get('security', 'user') == '') {
						$cache.session.put('security', 'user', $cache.get('security', 'user'));
					}
					gotoHome();
				} else if (alreadyAuthWith != 'none') {
					proceedAheadWithExternalAuthentication(alreadyAuthWith);
				} else if (!$scope.dbAuthSupported && $scope.SupportedAuthentications.length == 1) {
					authWith($scope.SupportedAuthentications[0]);
				} 
			}
			
			function isAlreadyAuthenticated() {
				if ($scope.authConfigs['O365'] != null) {
					var userInfo = $rootScope.userInfo;
					if (userInfo != null && userInfo.isAuthenticated != null && userInfo.profile != null && userInfo.profile.upn != null && userInfo.profile.upn != '') {
						return 'O365';
					}
				}
			
				return 'none';
			}
			
			function authWith(authType) {
				if (authType.type.toUpperCase() == 'O365') {
					adalService.login();
				}
			}
			
			function proceedAheadWithExternalAuthentication(alreadyAuthWith) {
				if (alreadyAuthWith == 'O365') {
					$scope.credentials.username = $rootScope.userInfo.profile.upn;
					$scope.credentials.password = sessionStorage.getItem('adal.idtoken');
					if ($scope.credentials.password == null || $scope.credentials.password == "") {
						$scope.credentials.password = localStorage.getItem('adal.idtoken');
					}
					authenticate('O365');
				}
			}
			
			function gotoHome() {
				$loader.show();
				$scope.user = $accessService.getActiveUser() || {};
				$accessService.proceedAhead();
				$loader.hide();
			}
			
			function getAPIBasePath() {
				return ((location.protocol == 'https:' || location.protocol == 'https') && $constants.HTTPSAPIBasePath != null && $constants.HTTPSAPIBasePath != '') ? $constants.HTTPSAPIBasePath : $constants.APIBasePath;
			}
			
			function authenticate(loginType) {
				if ($scope.credentials.username == null || $scope.credentials.username == ''){
					$notifier.error('Email is mandatory.');
					angular.element('#email').focus();
					return false;
				}
				if ($scope.credentials.password == null || $scope.credentials.password == ''){
					$notifier.error('Password is mandatory.');
					angular.element('#password').focus();
					return false;
				}
				$scope.credentials.loginType = loginType;
				$cache.session.put('loginType', 'type', loginType);
				
				$loader.show();
				$http.post(getAPIBasePath() + 'token', $scope.credentials)
					.success(function(response) {
						if (response == null) {
							response = {'status': 'error', 'error': 'Unable to connect to server. Please try after sometime.'}
						}
						
						if (response.status == 'error') {
							$loader.hide();
							var email = document.getElementsByName("email");
							var password = document.getElementsByName("password");
							if((email[0].value == "" || email[0].value == null) && (password[0].value == "" || password[0].value == null))
							{
								$notifier.error("Please Enter Valid Credentials");
								email[0].focus();
								return;
							}
							else if(email[0].value == "" || email[0].value == null)
							{
								$notifier.error("Please Enter Email Address");
								email[0].focus();
								return;
							}
							else if(password[0].value == "" || password[0].value == null)
							{
								$notifier.error("Please Enter Password");
								password[0].focus();
								return;
							}
							else
							{
								$notifier.error(response.error);
								return;
							}
						}
						
						var token = response.token;
						
						$cache.session.put('security', 'token', token);
						
						var cbOnActivity = function(){
							$dataService.get('users/me', function(user, status, headers, config){
								if ($scope.credentials.rememberMe) {
									$cache.put('security', 'user', user);
									$cache.put('security', 'token', token);
								} else {
									$cache.put('security', 'user', null);
									$cache.put('security', 'token', null);
								}
								
								$cache.session.put('security', 'user', user);
								
								if (user.accessibleModules != null && user.accessibleModules.length > 0) {
									$accessService.setSelectedModule($rootScope, user.accessibleModules[0]);
								}
								
								gotoHome();
							}, function(err){
								showError(err);
							});
						}
						
						cbOnActivity();
						
						/*$dataService.post('userActivities', {'activityType': 'login'}, function(response){
							cbOnActivity();
						}, function(err){
							cbOnActivity();
						});*/
					})
					.error(function(err) {
						showError(err);
					});
			}
			
			function showError(err) {
				console.log(err);
				$loader.hide();
				$notifier.error("Unable to connect to server. Please try after sometime.");
			}
			
			function forgotPassword() {
				var inputParams = {
				  'emailid' : $scope.credentials.username
				 }
				var modalInstance = $modal.open({
					animation: $scope.animationsEnabled,
					templateUrl: '/views/security/login/forgotPassword',
					controller: 'security.login.forgotPassword.controller',
					size: 'md',
					resolve: {
						params: function () {
							return inputParams;
						}
					}
				});
			};
			
			init();
		}
	]);