import angular from 'angular';

export class TsOpcUaNodeSetCtrl implements angular.IController {
    // Inheritance data
    connectStatus: string;

    // UI setting data

    constructor() {

    }

}



export class TsOpcUaNodeSetDirective implements angular.IDirective {
    templateUrl = require('./nodeset.html');
    restrict = 'E';
    bindToController = true;
    controller = TsOpcUaNodeSetCtrl;
    controllerAs = 'cm';
    scope = {
        connectStatus: "=",
    };

    /** @ngInject */
    constructor() {
    }
}

angular.module('thingspin.directives').directive('tsOpcNodeSet', [() => new TsOpcUaNodeSetDirective()]);
