// External Libraires
import React from 'react';
import { hot } from 'react-hot-loader';
import classNames from 'classnames';

// Grafana Components
import { DashboardGrid } from 'app/features/dashboard/dashgrid/DashboardGrid';

// ThingSPIN Components
import { FMDashboardPanel } from './FMDashboardPanel';

// (Customized grafana react component: iiHOC)
export class FMDashboardGrid extends DashboardGrid {

    // Override
    renderPanels() {
        const panelElements = [];
        for (const panel of this.props.dashboard.panels) {
            const panelClasses = classNames({ 'react-grid-item--fullscreen': panel.fullscreen });
            const id = panel.id.toString();
            panel.isInView = this.isInView(panel);
            panelElements.push(
                <div
                    key={id}
                    className={panelClasses}
                    id={'panel-' + id}
                    ref={elem => {
                        this.panelRef[id] = elem;
                    }}
                >
                    <FMDashboardPanel
                        panel={panel}
                        dashboard={this.props.dashboard}
                        isEditing={panel.isEditing}
                        isFullscreen={panel.fullscreen}
                        isInView={panel.isInView}
                    />
                </div>
            );
        }

        return panelElements;
    }
}

export default hot(module)(FMDashboardGrid);
