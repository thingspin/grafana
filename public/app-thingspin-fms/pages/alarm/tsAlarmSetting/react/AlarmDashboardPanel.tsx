// 3rd party libs
import React from 'react';
import classNames from 'classnames';

// Grafana libs
// Views
import { getAngularLoader } from '@grafana/runtime';
import { DashboardPanel } from 'app/features/dashboard/dashgrid/DashboardPanel';
import { PanelResizer } from 'app/features/dashboard/dashgrid/PanelResizer';

// ThingSPIN libs
// Views
import TsAlertTab from './TsAlertTab';

// (Customized grafana react component: iiHOC)
export class AlarmDashboardPanel extends DashboardPanel {

    // @Override
    componentDidUpdate() {
        const { panel, dashboard, isInView } = this.props;
        const { isLazy, angularPanel } = this.state;
        if (isLazy && isInView) {
          this.setState({ isLazy: false });
        }

        if (!this.element || angularPanel) {
          return;
        }

        const loader = getAngularLoader();
        const template = /*html*/`<alarm-plugin-component type="panel" class="panel-height-helper"></alarm-plugin-component>`;
        const ngPanel = loader.load(this.element, { panel, dashboard }, template);

        this.setState({ angularPanel: ngPanel });
    }

    // Override
    render(): JSX.Element {
        const { panel, dashboard, isFullscreen, isEditing } = this.props;
        const { plugin, angularPanel, isLazy } = this.state;

        if (this.isSpecial(panel.type)) {
            return this.specialPanels[panel.type]();
        }

        if (!plugin // if we have not loaded plugin exports yet, wait
            || isLazy // If we are lazy state don't render anything
        ) {
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

                <div className="panel-editor-container__editor">
                    <TsAlertTab angularPanel={angularPanel} dashboard={dashboard} panel={panel} />
                </div>
            </div>
        );
    }
}
