import angular from 'angular';

export class TsTagDefineCtrl implements angular.IController {
    data: any;
   /** @ngInject */
   constructor($scope: angular.IScope) {
       console.log("TagDefine : " + this.data);

       $scope.$watch('ctrl.data', (newValue: any, oldValue: any) => {
           console.log(newValue);
           console.log(oldValue);
       });
   }


}

export class TsTagDefineDirective implements angular.IDirective {
    templateUrl = require('./tagdefine.html');
    restrict = 'E';
    bindToController = true;
    controllerAs = 'ctrl';
    controller = TsTagDefineCtrl;
    replace = true;
    scope = {
        data: "="
    };

    /** @ngInject */
    constructor() {
    }
}

angular.module('thingspin.directives').directive('tsTagDefine', [() => new TsTagDefineDirective()]);
