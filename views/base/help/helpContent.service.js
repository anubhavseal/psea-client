'use strict';
angular.module('base')
	.factory('$helpContent', ['$dataService', function ($dataService){
		return {
			get: get
		};
		
		function get(groupId, controlId, successCallback, errorCallback) {
			if (groupId == null || groupId == '') {
				return successCallback(null);
			}
			controlId = controlId == null || controlId == '' ? groupId : controlId;
			$dataService.getFromCache('helpContents?groupId=' + groupId + "&controlId=" + controlId, successCallback, errorCallback);
		}
	}]);