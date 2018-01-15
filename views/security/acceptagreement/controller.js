angular.module('security')
	.controller('security.acceptagreement.controller', ['$scope', '$dataService', '$routeParams', '$location', '$constants', '$timeout', '$window', '$notifier',  '$accessService', 
	function ($scope, $dataService, $routeParams, $location, $constants, $timeout, $window, $notifier,  $accessService) {
		$scope.acceptAgreement = acceptAgreement;
		
		function acceptAgreement() {
			var user = $accessService.getActiveUser();
			
			if (user != null && user.userId != null && user.userId != "") {
				$dataService.put('users/' + user.userId, {'agreementAccepted': true}, function(response){
					user.agreementAccepted = true;
					$accessService.setActiveUser(user);
					$accessService.proceedAhead();
				});
			}
		}
		
		function init() {
			var user = $accessService.getActiveUser();;
			try{
				user.accountExpiry = user.accountExpiry == null || user.accountExpiry == '' ? null : new Date('' + user.accountExpiry);
			}catch(e){
				user.accountExpiry = null;
			};
			
			if (user.accountExpiry != null) {
				user.accountExpiryDays = parseInt((user.accountExpiry.getTime() - (new Date()).getTime()) / (24 * 60 * 60 * 1000));
			}
			
			$scope.user = user;
		}
		
		init();
	}]);
