
import { MetricsPanelCtrl } from 'app/plugins/sdk';

export class JupyterNotebookCtrl extends MetricsPanelCtrl {
  static templateUrl: string = require('./module.html');

  jupyterImg = '';

  /** @ngInject */
  constructor($scope: angular.IScope, $injector: any) {
    super($scope, $injector);

    $scope.$watch('jupyterGraph', (jupyterGraph) => {
      this.jupyterImg = `data:image/png;base64,${jupyterGraph}`;
    });
  }
}

export {
  JupyterNotebookCtrl as PanelCtrl
};
