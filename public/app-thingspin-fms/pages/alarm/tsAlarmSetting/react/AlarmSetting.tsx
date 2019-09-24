// 3rd party libs
import angular from 'angular';
import React, { ReactNode } from "react";
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Grafana libs
// Models
import { getAngularLoader, getDataSourceSrv } from '@grafana/runtime';
import { getAlertingValidationMessage } from 'app/features/alerting/getAlertingValidationMessage';
import { StoreState } from 'app/types';
// Views
import { UnConnectedAlertTab } from 'app/features/alerting/AlertTab';
import { EditorTabBody, EditorToolbarView } from 'app/features/dashboard/panel_editor/EditorTabBody';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
// Controllers
import { changePanelEditorTab } from 'app/features/dashboard/panel_editor/state/actions';

// ThingSPIN libs
// Models
import { FMDashboardModel } from 'app-thingspin-fms/pages/FacilityMonitoring/models';
// Views
import FacilityTree from 'app-thingspin-fms/react/components/FacilityNodeTree';

export class AlarmSetting extends UnConnectedAlertTab {
  // bind global Angularjs Injector
  private $injector = angular.element(document).injector();

  // Override
  async loadAlertTab() {
    const { angularPanel, panel } = this.props;
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

    const validatonMessage = await getAlertingValidationMessage(
      panel.transformations,
      panel.targets,
      getDataSourceSrv(),
      panel.datasource
    );

    if (validatonMessage) {
      this.setState({ validatonMessage });
    }
  }

  // thingspin add func
  onUpdatePanel = (params: any) => {
    const { Taginfo } = params;
    const { dashboard, panel } = this.props;

    // update target
    panel.targets = Taginfo.map( (node: any) => ({
      checked: [node.value],
      refId: node.label,
      siteId: 1,
      tagNodes: [node],
    }));

    // update alarm rule
    this.panelCtrl.events.emit("ts-update-alarm", params);

    // set FacilityTree in dashboard
    (dashboard as FMDashboardModel).facilityTags = params.Taginfo;
    (dashboard as FMDashboardModel).site = params.siteData;


    panel.refresh();
  }

  // thingspin add func
  renderFacilityTree(): ReactNode {
    const { facilityTags, site } = this.props.dashboard as FMDashboardModel;

    return <div className="fm-left-tree">
      <FacilityTree
        siteinfo={site}
        taginfo={facilityTags}
        inject={this.$injector}
        click={this.onUpdatePanel}
      />
    </div>;
  }

  // Override
  render() {
    const { alert } = this.props.panel;
    const { validatonMessage } = this.state;

    if (!alert && validatonMessage) {
      return this.renderValidationMessage();
    }

    const toolbarItems: EditorToolbarView[] = [this.stateHistory()];

    return <>
      {this.renderFacilityTree()}

      <div className="ts-panel-editor__right">
        <EditorTabBody heading="알람" toolbarItems={toolbarItems}>
          <div ref={element => (this.element = element)} />
        </EditorTabBody>
      </div>
    </>;
  }
}

export const mapStateToProps = (state: StoreState) => ({});

const mapDispatchToProps = { changePanelEditorTab };

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AlarmSetting)
);
