import angular from 'angular';
import TsSiteManagementCtrl from './controller';

class TsSiteManagementDirective implements angular.IDirective {
  templateUrl = require('./index.html');
  restrict = 'E';
  bindToController = true;
  controllerAs = 'ctrl';
  controller = TsSiteManagementCtrl;

  /** @ngInject */
  constructor() {
  }
}

angular.module('thingspin.directives').directive('tsSiteManagement', [() => new TsSiteManagementDirective()]);
