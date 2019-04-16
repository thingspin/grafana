import angular from 'angular';
import TsConnectManagementCtrl from './controller';

class TsConnectManagementDirective implements angular.IDirective {
  templateUrl = require('./index.html');
  restrict = 'E';
  bindToController = true;
  controllerAs = 'ctrl';
  controller = TsConnectManagementCtrl;

  /** @ngInject */
  constructor() {
  }
}

angular.module('thingspin.directives').directive('tsConnectManagement', [() => new TsConnectManagementDirective()]);
