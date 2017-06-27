'use strict';
angular.module('base')
	.factory('$lookupConfigService', ['$constants', '$log', '$http', '$cache', '$dataService', function($constants, $log, $http, $cache, $dataService){
		
		return {
			get: get,
			getByFunctionId: getByFunctionId,
			getByType: getByType
		};
		
		function getByType(lookupType, successCallback, errorCallback) {
			getByField('lookupType', lookupType, successCallback, errorCallback);
		}
		
		function get(lookupConfigId, successCallback, errorCallback) {
			getByField('lookupConfigId', lookupConfigId, successCallback, errorCallback);
		}
		
		function getByFunctionId(functionId, successCallback, errorCallback) {
			getByField('functionId', functionId, successCallback, errorCallback);
		}
		
		function getByField(fieldName, fieldValue, successCallback, errorCallback) {
			var lookupConfigs = $cache.session.get('lookup', 'config');
			
			if (lookupConfigs == null) {
				$dataService.get('lookupConfigs', function(data) {
					lookupConfigs = data == null ? [] : data;
					
					for(var i=0; i<lookupConfigs.length; i++) {
						lookupConfigs[i] = rationalizeConfig(lookupConfigs[i]);
					}
					
					$cache.session.put('lookup', 'config', lookupConfigs);
					search(lookupConfigs, fieldName, fieldValue, successCallback, errorCallback);
				}, errorCallback);
			} else {
				search(lookupConfigs, fieldName, fieldValue, successCallback, errorCallback);
			}
		}

		function rationalizeConfig(lookupConfig) {
			var columns = lookupConfig.columns || [];
			if (columns == null || columns == [] || columns.length === 0) {
				columns = [];
				columns.push({"id": 1, "caption":"ID", "column":"lookupCode", "controlType":"text"});
				columns.push({"id": 2, "caption":"Name", "column":"lookupName", "controlType":"text"});
			}
			
			if (lookupConfig.sequenceField == '1') {
				lookupConfig.sequenceField = 'sequence';
			}
			
			lookupConfig.canMove = lookupConfig.sequenceField != null && lookupConfig.sequenceField != '';
			
			lookupConfig.canDelete = lookupConfig.canDelete == null ? false : lookupConfig.canDelete;
			lookupConfig.canAdd = lookupConfig.canAdd == null ? false : lookupConfig.canAdd;
			lookupConfig.canEdit = lookupConfig.canEdit == null ? true : lookupConfig.canEdit;
			
			var totalPerc = 97;
			if (lookupConfig.canMove) {
				totalPerc -= 3;
			}
			if (lookupConfig.canDelete) {
				totalPerc -= 4;
			}
			
			for(var i=0; i<columns.length; i++) {
				var column = columns[i];
				column.id = column.id || column.column;
				column.column = column.column || column.id;
				column.controlType = (column.controlType || 'text').toLowerCase();
				column.idKey = column.idKey || 'id';
				column.captionKey = column.captionKey || 'caption';
				column.hidden = column.hidden == null ? false : column.hidden;
				column.editable = column.editable == null ? true : column.editable;
				column.width = column.width || ((95 / (columns.length + 1)) + '%');
				
				var html = '';
				if (column.controlType === 'dropdown') {
					// html = '<label style="width:100%" class="column-normal" editable-select="item.'+ column.column +'" e-ng-options=="option.caption for option in control.options" blur="submit" buttons="no">{{item. '+ column.column +' }}</label>';
					html = '<select ng-options=="option.caption for option in control.options"></select>'
				} else {
					// html = '<label e-style="width:100%" class="column-normal" editable-text="item.'+ column.column +'" blur="submit" buttons="no">{{item. '+ column.column +' || "Provide ' + (column.caption || '') + '"}}</label>';
					html = '<label ng-show="!column.editable || !lookupConfig.canEdit">{{item.'+ column.column +'}}</label><input ng-show="column.editable && lookupConfig.canEdit" type="text" ng-model="item.'+ column.column +'" ng-value="item.'+ column.column +'" placeholder="Provide ' + (column.caption || '') + '"/>'
				}
				column.html = column.html == null || column.html === '' ? html : column.html;
			}
			lookupConfig.columns = columns;
			
			var defaultDataApi = 'lookups?lookupType=' + lookupConfig.lookupType;
			if (lookupConfig.canMove) {
				defaultDataApi += "&order.by=" + lookupConfig.sequenceField;
			}
			
			lookupConfig.dataAPI = lookupConfig.dataAPI || defaultDataApi;
			lookupConfig.primaryKeyField = lookupConfig.primaryKeyField || 'lookupId';
			lookupConfig.defaultFields = lookupConfig.defaultFields || [{'field': 'lookupType', 'value': lookupConfig.lookupType}];

			if (lookupConfig.buttons == null || lookupConfig.buttons === [] || lookupConfig.buttons.length === []) {
				var buttons = [];
				if (lookupConfig.canMove || lookupConfig.canAdd || lookupConfig.canEdit || lookupConfig.canDelete) {
					buttons.push({'action' : 'save();', 'class': 'btn-primary', 'caption' : 'Save', 'checkForm': true});
				}
				lookupConfig.buttons = buttons;
			}
			
			var index = lookupConfig.dataAPI.indexOf('?');
			index = index == -1 ? lookupConfig.dataAPI.length : index;
			lookupConfig.syncApi = lookupConfig.dataAPI.substr(0, index);
			return lookupConfig;
		}
		
		function search(lookupConfigs, fieldName, fieldValue, successCallback, errorCallback) {
			try{
				var configs = [];
				for(var i=0; i<lookupConfigs.length; i++) {
					var config = lookupConfigs[i];
					if ('' + config[fieldName] === '' + fieldValue) {
						configs.push(config);
					}
				}
				successCallback(configs);
			}catch(e) {
				errorCallback(e);
			}
		}
	}]);