(function () {
	'use strict';

	angular.module('base')
		.factory('$tree', ['$constants', '$log', '$http', function ($constants, $log, $http){
		
			return {
				convert: convertDataToTreeData,
				forEach: forEach
			};
		
			function convertDataToTreeData(data, idField, parentIdField, childrenField) {
				idField = idField || 'id';
				parentIdField = parentIdField || 'parentId';
				childrenField = childrenField || 'children';
			
				var mapNodes = {};
			
				var rootNodes = [];
				for(var i=0; i<data.length; i++) {
					var node = data[i];
					node[childrenField] = null;
					mapNodes[node[idField]] = node;
					node.collapsed = false;
				}
			
				for(var i=0; i<data.length; i++) {
					var node = data[i];
					var parentId = node[parentIdField];
				
					var parentNode = mapNodes[parentId];
					if (parentNode == null) {
						rootNodes.push(node);
						continue;
					}
				
					var childrens = parentNode[childrenField] || [];
					childrens.push(node);
					parentNode[childrenField] = childrens;
					parentNode.collapsed = true;
				}
			
				return rootNodes;
			}
		
			function forEach(nodeList, funct, childrenField) {
				if (nodeList == null) {
					return;
				}
				if (nodeList.length == null) {
					nodeList = [nodeList];
				}
				angular.forEach(nodeList, function(node){
					try{
						funct(node);
					}catch(e){
					}
				
					var childs = node[childrenField || 'children'];
					if (childs != null) {
						forEach(childs, funct, childrenField);
					}
				});
			}
		}]);
})();
