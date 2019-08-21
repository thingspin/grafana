// External Libraries
import React from 'react';

// Grafana Components
import { PanelEditor } from 'app/features/dashboard/panel_editor/PanelEditor';

// ThingSPIN Components
import TsAlertTab from './TsAlertTab';

// (Customized grafana react component: iiHOC)
export class AlarmPanelEditor extends PanelEditor {

  // Override
  render() {
    const { panel, dashboard, angularPanel } = this.props;

    return (
      <div className="panel-editor-container__editor">
        <div className="ts-panel-editor__right">
          <TsAlertTab angularPanel={angularPanel} dashboard={dashboard} panel={panel} />
        </div>
      </div>
    );
  }
}
