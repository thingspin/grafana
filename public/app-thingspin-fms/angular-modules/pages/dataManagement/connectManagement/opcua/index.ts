import angular from 'angular';

import './connectInfo';
import './nodeset';

import TsOpcUaConnectCtrl from './controller';

export class TsOpcUaConnectDirective implements angular.IDirective {
  templateUrl = require('./index.html');
  restrict = 'E';
  bindToController = true;
  controllerAs = 'ctrl';
  controller = TsOpcUaConnectCtrl;

  /** @ngInject */
  constructor() {
  }
}

angular.module('thingspin.directives').directive('tsOpcuaConnect', [() => new TsOpcUaConnectDirective()]);
