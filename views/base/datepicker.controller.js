angular.module('base')
    .controller('base.datepicker.controller', ['$scope',
    function ($scope) {
        $scope.open = function($event) {
            $scope.status.opened = true;
        };

        $scope.status = {
            opened: false
        };
}]);

