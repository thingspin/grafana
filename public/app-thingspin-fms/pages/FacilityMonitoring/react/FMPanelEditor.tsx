// External Libraries
import React from 'react';

// Grafana Components
import { PanelEditor } from 'app/features/dashboard/panel_editor/PanelEditor';
import { GeneralTab } from 'app/features/dashboard/panel_editor/GeneralTab';
import { AlertTab } from 'app/features/alerting/AlertTab';

// ThingSPIN Components
import FMVisualizationTab from './FMViauslizationTab';
import FMQueriesTab from './FMQueriesTab';

// (Customized grafana react component: iiHOC)
export class FMPanelEditor extends PanelEditor {
    // Override
    renderCurrentTab(activeTab: string) {
        const { panel, dashboard, onTypeChanged, plugin, angularPanel } = this.props;

        switch (activeTab) {
            case 'advanced':
                return <GeneralTab panel={panel} />;
            case 'queries':
                return <FMQueriesTab panel={panel} dashboard={dashboard} />;
            case 'alert':
                return <AlertTab angularPanel={angularPanel} dashboard={dashboard} panel={panel} />;
            case 'visualization':
                return (
                    <FMVisualizationTab
                        panel={panel}
                        dashboard={dashboard}
                        plugin={plugin}
                        onTypeChanged={onTypeChanged}
                        angularPanel={angularPanel}
                    />
                );
            default:
                return null;
        }
    }
}
