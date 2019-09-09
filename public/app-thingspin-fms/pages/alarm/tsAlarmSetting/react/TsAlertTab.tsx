// 3rd party libs
import React from "react";

// Grafana libs
// Models
// Views
import { AlertTab } from 'app/features/alerting/AlertTab';
import { EditorTabBody } from 'app/features/dashboard/panel_editor/EditorTabBody';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
// Controllers
import { getAngularLoader } from '@grafana/runtime';

// ThingSPIN libs
// Models
import { FMDashboardModel } from 'app-thingspin-fms/pages/FacilityMonitoring/models';
// Views
import AlarmFacilityTree from './AlarmFacilityTree';
import { TreeInfo } from 'app-thingspin-fms/react/components/FacilityNodeTree/model';

export default class TsAlertTab extends AlertTab {

  // Override
  loadAlertTab() {
    const { angularPanel } = this.props;
    const { $$childHead } = angularPanel.getScope();

    // When full page reloading in edit mode the angular panel has on fully compiled & instantiated yet
    if (!$$childHead) {
      setTimeout(() => { this.forceUpdate(); });
      return;
    }

    this.panelCtrl = $$childHead.ctrl;

    const scopeProps = { ctrl: this.panelCtrl };
    const loader = getAngularLoader();
    const template = '<ts-alert-tab />';

    this.component = loader.load(this.element, scopeProps, template);
    this.forceUpdate();
  }

  // thingspin add func
  onUpdatePanel = (params: TreeInfo) => {
    const { Taginfo } = params;
    const { panel } = this.props;

    // update target
    panel.targets = Taginfo.map( (node: any) => ({
      checked: [node.value],
      refId: node.label,
      siteId: 1,
      tagNodes: [node],
    }));

    // update alarm rule
    this.panelCtrl.events.emit("ts-update-alarm", params);

    panel.refresh();
  }

  // Override
  render() {
    const { panel, dashboard } = this.props;
    const { alert } = panel;

    const toolbarItems = alert ? [this.stateHistory(), this.testRule(), this.deleteAlert()] : [];

    return <>
      <AlarmFacilityTree
        // meta
        panel={panel}
        dashboard={dashboard as FMDashboardModel}
        // events
        onUpdatePanel={this.onUpdatePanel}
      />

      <div className="ts-panel-editor__right">
        <EditorTabBody heading="알람" toolbarItems={toolbarItems}>
          <>
            <div ref={element => (this.element = element)} />

            {!alert && <EmptyListCTA
              title='Panel has no alert rule defined'
              buttonIcon='gicon gicon-alert'
              onClick={this.onAddAlert}
              buttonTitle='Create Alert'
            />}
          </>
        </EditorTabBody>
      </div>
    </>;
  }
}
