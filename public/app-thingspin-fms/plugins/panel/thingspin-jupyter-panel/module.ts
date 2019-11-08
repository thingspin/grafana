
import { MetricsPanelCtrl } from 'app/plugins/sdk';

export class JupyterNotebookCtrl extends MetricsPanelCtrl {
  static templateUrl: string = require('./module.html');

  /** @ngInject */
  constructor($scope: angular.IScope, $injector: any) {
    super($scope, $injector);
  }
}

export {
  JupyterNotebookCtrl as PanelCtrl
};
