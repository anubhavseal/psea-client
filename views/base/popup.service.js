'use strict';
angular.module('base')
	.factory('$popup', ['$modal', function($modal){
		return {
			open :openPopup,
			registerFunctions: registerFunctions,
			setCaption: setCaption,
			addButton: addButton,
			setButtons: setButtons
		};
		
		function openPopup(templateUrl1, controller1, inputParams, size) {
			var params = {};
			inputParams = inputParams || {};
			angular.forEach(inputParams, function(value, key){
				params[key] = function(){
					return inputParams[key];
				}
			});

			var modalInstance = $modal.open({
				animation: true,
				templateUrl: templateUrl1,
				controller: controller1,
				size: size || 'md',
				resolve: params
			});
		}
		
		function registerFunctions($scope, $modalInstance) {
			$scope.handleActionClick = function(actionControl, actionType){
				try{
					actionType = actionType || 'action';
					var action = actionControl[actionType];
					if (action == undefined || action == null) {
						action = angular.element(actionControl.target).data(actionType);
					}
					if (action) {
						eval(action);
					}
				} catch(e) {
					console.log('Error occured: ' + e);
				}
			}
			
			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			}
		}
		
		function setCaption($scope, caption) {
			$scope.modalCaption = caption;
		}
		
		function addButton($scope, caption, action, className) {
			$scope.buttons = $scope.buttons || [];
			$scope.buttons.push({'action': action, 'class': className || 'btn-default', 'caption': caption});
		}
		
		function setButtons(buttons) {
			$scope.buttons = buttons || [];
		}
	}]);