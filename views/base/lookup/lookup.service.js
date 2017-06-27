"use strict";

angular.module('base')
    .factory('$lookupService', ['$dataService', '$lookupConfigService', '$accessService', function ($dataService, $lookupConfigService, $accessService) {
		
    return {
        getByType: getByType
    };        
         
    function getByType (lookupType, callback) {
		$lookupConfigService.getByType(lookupType, function(lookupConfigs){
			getData(lookupType, ((lookupConfigs != null && lookupConfigs.length > 0) ? lookupConfigs[0].tenantSpecific : false), callback)
		}, function(){
			callback(null);
		});
    };
	
	function getData(lookupType, tenantSpecific, callback) {
		var url = 'lookups?lookupType=' + lookupType;
		if (tenantSpecific){
			var tenantId = $accessService.getSelectedTenant() == null ? -1 : $accessService.getSelectedTenant().tenantId;
			url = url + '&tenantId=' + tenantId;
		}
		$dataService.getFromCache(url, callback);
	}
}]);