angular.module('base')
	.controller('base.dashboard.settings.controller', ['$scope', '$modalInstance','params','$notifier',
		function ($scope, $modalInstance, params, $notifier) {
            $scope.modalCaption = "<h3 class='modal-title'>Settings</h3>";
			
			$scope.intervalTypes = [
				{"id": "S", "caption": "Seconds"},
				{"id": "M", "caption": "Minutes"}
			];
			
			function init() {
				$scope.settings = {};
				$scope.settings.autoRefreshEnabled = false;
				$scope.settings.interval = null;
				$scope.settings.intervalType = $scope.intervalTypes[0];
				
				if (params.settings != null && params.settings.autoRefresh != null) {
					$scope.settings.autoRefreshEnabled = params.settings.autoRefresh.enabled;
					$scope.settings.interval = params.settings.autoRefresh.interval;
					angular.forEach($scope.intervalTypes, function(intervalType){
						if (intervalType.id == params.settings.autoRefresh.intervalType) {
							$scope.settings.intervalType = intervalType;					
						}
					});
				}
			}
			
            $scope.ok = function () {
				if ($scope.settings.autoRefreshEnabled && ($scope.settings.interval == null || $scope.settings.interval <= 0)) {
					$notifier.error('Please provide refresh interval');
					return;
				}
				
				if ($scope.settings.autoRefreshEnabled && $scope.settings.intervalType == null) {
					$notifier.error('Please provide refresh interval type');
					return;
				}
				
				params.settings = params.settings || {};
				
				params.settings.autoRefresh = params.settings.autoRefresh || {};
				
				params.settings.autoRefresh.enabled = $scope.settings.autoRefreshEnabled;
				params.settings.autoRefresh.interval = $scope.settings.interval;
				params.settings.autoRefresh.intervalType = $scope.settings.intervalType == null ? null : $scope.settings.intervalType.id;
				
				if (params.callback) {
					params.callback(params.settings);
				}
				$modalInstance.dismiss('ok');
			}
			
         	$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
           
			$scope.saveAccess = true;
			$scope.saveButtonCaption = "OK";
			
			init();
		}]);
		