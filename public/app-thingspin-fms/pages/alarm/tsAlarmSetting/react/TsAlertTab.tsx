// Grafana libs
import { AngularComponent, getAngularLoader } from '@grafana/runtime';

import { AlertTab } from 'app/features/alerting/AlertTab';
import { DashboardModel, PanelModel } from 'app/features/dashboard/state';

export interface Props {
  angularPanel?: AngularComponent;
  dashboard: DashboardModel;
  panel: PanelModel;
}

export default class TsAlertTab extends AlertTab {

  loadAlertTab() {
    const { angularPanel } = this.props;

    const scope = angularPanel.getScope();

    // When full page reloading in edit mode the angular panel has on fully compiled & instantiated yet
    if (!scope.$$childHead) {
      setTimeout(() => {
        this.forceUpdate();
      });
      return;
    }

    this.panelCtrl = scope.$$childHead.ctrl;
    const loader = getAngularLoader();
    const template = '<ts-alert-tab />';

    const scopeProps = { ctrl: this.panelCtrl };

    this.component = loader.load(this.element, scopeProps, template);
  }
}
