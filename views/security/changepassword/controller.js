angular.module('security')
	.controller('security.changepassword.controller', ['$scope', '$dataService', '$notifier', '$accessService', '$constants', '$window', '$loader','$location',
		function ($scope, $dataService, $notifier, $accessService, $constants, $window, $loader, $location) {
			$scope.tab = 'presentation';
			$scope.savePassword = savePassword
			$scope.credentials = {
				password: null,
				newPassword: null,
				confirmPassword: null,
				passwordExpired: false
			};

			function savePassword() {
				var userId = $accessService.getUserId();
				if (userId == null || userId == '' || '' + userId == '0' || userId == '-') {
					$notifier.error('Please login to change the password.');
					return;
				}
				$dataService.put(
					'users/' + $accessService.getUserId() + '/changepassword', 
					$scope.credentials, 
					function(response) {
						if (response.status == 'error') {
							$notifier.error(response.err);
							return;
						}
						$notifier.success('Password changed successfully.');
						
						var url = '' + $window.location;
						if (url.indexOf($constants.ChangePasswordPage) !== -1) {
							var user = $accessService.getActiveUser();
							
							if (user != null) {
								user.passwordExpired = false;
								$accessService.setActiveUser(user);
								$accessService.proceedAhead();
							}
						}
					}
				);
				
			}
		}
	]);