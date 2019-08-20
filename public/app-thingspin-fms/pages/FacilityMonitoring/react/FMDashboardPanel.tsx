// External Libraies
import React from 'react';
import classNames from 'classnames';

// Grafana Components
import { DashboardPanel } from 'app/features/dashboard/dashgrid/DashboardPanel';
import { PanelResizer } from 'app/features/dashboard/dashgrid/PanelResizer';

// ThingSPIN Components
import { FMPanelEditor } from './FMPanelEditor';

// (Customized grafana react component: iiHOC)
export class FMDashboardPanel extends DashboardPanel {

    // Override
    render() {
        const { panel, dashboard, isFullscreen, isEditing } = this.props;
        const { plugin, angularPanel, isLazy } = this.state;

        if (this.isSpecial(panel.type)) {
            return this.specialPanels[panel.type]();
        }

        // if we have not loaded plugin exports yet, wait
        if (!plugin) {
            return null;
        }

        // If we are lazy state don't render anything
        if (isLazy) {
            return null;
        }

        const editorContainerClasses = classNames({
            'panel-editor-container': isEditing,
            'panel-height-helper': !isEditing,
        });

        const panelWrapperClass = classNames({
            'panel-wrapper': true,
            'panel-wrapper--edit': isEditing,
            'panel-wrapper--view': isFullscreen && !isEditing,
        });

        return (
            <div className={editorContainerClasses}>
                <PanelResizer
                    isEditing={isEditing}
                    panel={panel}
                    render={styles => (
                        <div
                            className={panelWrapperClass}
                            onMouseEnter={this.onMouseEnter}
                            onMouseLeave={this.onMouseLeave}
                            style={styles}
                        >
                            {this.renderPanel()}
                        </div>
                    )}
                />
                {panel.isEditing && (
                    <FMPanelEditor
                        panel={panel}
                        plugin={plugin}
                        dashboard={dashboard}
                        angularPanel={angularPanel}
                        onPluginTypeChange={this.onPluginTypeChange}
                    />
                )}
            </div>
        );
    }
}
