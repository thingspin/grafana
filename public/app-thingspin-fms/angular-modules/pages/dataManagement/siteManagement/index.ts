import angular from "angular";
import './tagdefine';
import './sitetable';

export class TsSiteManagementCtrl implements angular.IController {
    siteID = 0;
    /** @ngInject */
    constructor() {}// Dependency Injection
}

export default class TsSiteManagement implements angular.IDirective {
    templateUrl = require("./index.html");
    controller = TsSiteManagementCtrl;
    controllerAs = "ctrl";

    constructor() {}
}

angular.module('thingspin.directives').directive('tsSiteManagement', [() => new TsSiteManagement()]);
