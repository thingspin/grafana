import angular from 'angular';

export class TsTagDefineCtrl implements angular.IController {
   /** @ngInject */
   constructor() {}
}

export class TsTagDefineDirective implements angular.IDirective {
    templateUrl = require('./tagdefine.html');
    restrict = 'E';
    bindToController = true;
    controllerAs = 'tag';
    controller = TsTagDefineCtrl;
    replace = true;

    /** @ngInject */
    constructor() {
    }
}

angular.module('thingspin.directives').directive('tsTagDefine', [() => new TsTagDefineDirective()]);
