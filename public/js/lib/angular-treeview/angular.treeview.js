/*
	@license Angular Treeview version 0.1.6
	ⓒ 2013 AHN JAE-HA http://github.com/eu81273/angular.treeview
	License: MIT


	[TREE attribute]
	angular-treeview: the treeview directive
	tree-id : each tree's unique id.
	tree-model : the tree model on $scope.
	node-id : each node's id
	node-label : each node's label
	node-children: each node's children

	<div
		data-angular-treeview="true"
		data-tree-id="tree"
		data-tree-model="roleList"
		data-node-id="roleId"
		data-node-label="roleName"
		data-node-children="children" >
	</div>
*/

(function ( angular ) {
	'use strict';

	angular.module( 'angularTreeview', [] ).directive( 'treeModel', ['$compile', function( $compile ) {
		return {
				restrict: 'A',
				link: function ( scope, element, attrs ) {					
					//tree id
					var treeId = attrs.treeId;
					
					var treeLabelNodeClass = attrs.treeLabelNodeClass;
					if (treeLabelNodeClass == null) {
						treeLabelNodeClass = "col-md-10";
					}
				
					//tree model
					var treeModel = attrs.treeModel;

					//node id
					var nodeId = attrs.nodeId || 'id';

					//node label
					var nodeLabel = attrs.nodeLabel || 'label';

					//children
					var nodeChildren = attrs.nodeChildren || 'children';
					
					var adjacentTemplate = null;
					
					if (attrs.adjacentTemplateId != null && attrs.adjacentTemplateId != '') {
						adjacentTemplate = angular.element('#' + attrs.adjacentTemplateId).html();
					}
					
					if (adjacentTemplate == null) {
						adjacentTemplate = "";
					}
					adjacentTemplate = adjacentTemplate.replace(/@#/g, "{{");
					adjacentTemplate = adjacentTemplate.replace(/#@/g, "}}");

					var labelTemplate = null;
					
					if (attrs.labelTemplateId != null && attrs.labelTemplateId != '') {
						labelTemplate = angular.element('#' + attrs.labelTemplateId).html();
					} 
					
					if (labelTemplate == null || labelTemplate === '') {
						labelTemplate = '<span>{{node.' + nodeLabel + '}}</span>';
					}
					labelTemplate = labelTemplate.replace(/@#/g, "{{");
					labelTemplate = labelTemplate.replace(/#@/g, "}}");

					var	template = 
							'<ul>' +
								'<li data-ng-repeat="node in ' + treeModel + '">' +
									'<div class="clearfix">' + 
										'<div class="' + treeLabelNodeClass + '">' + 
											'<div class="labelText">' +
												'<i class="fa fa-plus-square-o fa-fw" data-ng-show="node.' + nodeChildren + ' != null && node.' + nodeChildren + '.length > 0 && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
												'<i class="fa fa-minus-square-o fa-fw" data-ng-show="node.' + nodeChildren + ' != null && node.' + nodeChildren + '.length > 0 && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
												labelTemplate + 
											'</div>' + 
										'</div>' +
										adjacentTemplate + 
									'</div>' +
									'<div class="childNode" data-tree-label-node-class="' + treeLabelNodeClass + '" data-label-template-id="' + attrs.labelTemplateId + '" data-adjacent-template-id="' + attrs.adjacentTemplateId + '" class="childNode" data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
								'</li>' +
							'</ul>';

					//check tree id, tree model
					if( treeId && treeModel ) {

						//root node
						if( attrs.angularTreeview ) {
						
							//create tree object if not exists
							scope[treeId] = scope[treeId] || {};

							//if node head clicks,
							scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function( selectedNode ){

								//Collapse or Expand
								selectedNode.collapsed = !selectedNode.collapsed;
							};

							//if node label clicks,
							scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function( selectedNode ){

								//remove highlight from previous node
								if( scope[treeId].currentNode && scope[treeId].currentNode.selected ) {
									scope[treeId].currentNode.selected = undefined;
								}

								//set highlight to selected node
								selectedNode.selected = 'selected';

								//set currentNode
								scope[treeId].currentNode = selectedNode;
							};
						}

						//Rendering template.
						element.html('').append( $compile( template )( scope ) );
					}
				}
			};
	}]);
})( angular );
