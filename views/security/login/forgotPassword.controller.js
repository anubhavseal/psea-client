angular.module('security')
	.controller('security.login.forgotPassword.controller', ['$scope', '$dataService', '$notifier', '$modalInstance', 'params',
		function ($scope, $dataService, $notifier, $modalInstance, params) {
			$scope.userMailId = params.emailid;
			$scope.ok = function () {
				var emailId = $scope.userMailId;
				
				if (emailId == null || emailId == ''){
					$notifier.error('Please provide email.');
					return;
				}
				
				$dataService.put('user/forgotPassword', {'email': emailId}, function(response) {
					console.log(response);
					$notifier.notify('We have sent mail to ' + $scope.userMailId + ' along with the one time credentials. Request you to check your mail.');			
					$modalInstance.dismiss('ok');
				});
			}
			
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
			
			$scope.saveAccess = true;
			$scope.saveButtonCaption = "Forgot Password";
			$scope.modalCaption = "<h3 class='modal-title theme-title'>Forgot Password</h3>";
		}
	]);