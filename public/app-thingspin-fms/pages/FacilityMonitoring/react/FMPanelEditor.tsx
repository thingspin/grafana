// Js 3rd party libs
import React from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Grafana libs
import { AlertTab } from 'app/features/alerting/AlertTab';
import { GeneralTab } from 'app/features/dashboard/panel_editor/GeneralTab';
import { mapStateToProps } from 'app/features/dashboard/panel_editor/PanelEditor';
import { UnConnectedPanelEditor } from 'app/features/dashboard/panel_editor/PanelEditor';
import {
    changePanelEditorTab,
    panelEditorCleanUp,
    refreshPanelEditor
} from 'app/features/dashboard/panel_editor/state/actions';

// ThingSPIN libs
import FMVisualizationTab from './FMViauslizationTab';
import FMQueriesTab from './FMQueriesTab';
import { TsAnalyticsTab } from 'app-thingspin-fms/react/components/TsAnalyticsTab/TsAnalyticsTab';

// (Customized grafana react component: iiHOC)
export class UnConnectedFMPanelEditor extends UnConnectedPanelEditor {
    // Override
    renderCurrentTab(activeTab: string) {
        const { panel, dashboard, onPluginTypeChange, plugin, angularPanel } = this.props;

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
                        onPluginTypeChange={onPluginTypeChange}
                        angularPanel={angularPanel}
                    />
                );
            case 'analytics':
                return (
                    <TsAnalyticsTab panel={panel} angularPanel={angularPanel}/>
                );
            default:
                return null;
        }
    }
}

export const mapDispatchToProps = { refreshPanelEditor, panelEditorCleanUp, changePanelEditorTab };

export const FMPanelEditor = hot(module)(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(UnConnectedFMPanelEditor)
);
