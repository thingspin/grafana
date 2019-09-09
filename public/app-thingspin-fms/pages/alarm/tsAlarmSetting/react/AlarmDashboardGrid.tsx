// 3rd party libs
import React from 'react';
import { hot } from 'react-hot-loader';
import classNames from 'classnames';

// Grafana Components
import { DashboardGrid } from 'app/features/dashboard/dashgrid/DashboardGrid';

// ThingSPIN Components
import { AlarmDashboardPanel } from './AlarmDashboardPanel';

// (Customized grafana react component: iiHOC)
export class AlarmDashboardGrid extends DashboardGrid {

    // customize renderPanels method
    // override
    renderPanels() {
        const { dashboard } = this.props;
        const [ panel ] = dashboard.panels;
        const { id, fullscreen, isEditing } = panel;
        const panelClasses = classNames({ 'react-grid-item--fullscreen': fullscreen });

        panel.isInView = this.isInView(panel);

        return [ <div
            key={id}
            className={panelClasses}
            id={`panel-${id}`}
            ref={elem => { this.panelRef[id] = elem; }}
        >
            <AlarmDashboardPanel
                panel={panel}
                dashboard={dashboard}
                isEditing={isEditing}
                isFullscreen={fullscreen}
                isInView={panel.isInView}
            />
        </div> ];
    }
}

export default hot(module)(AlarmDashboardGrid);
