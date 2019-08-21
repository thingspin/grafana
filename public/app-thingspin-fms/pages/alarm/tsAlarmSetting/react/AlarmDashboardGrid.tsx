// 3rd party libs
import React from 'react';
import { hot } from 'react-hot-loader';
import classNames from 'classnames';
// @ts-ignore
import sizeMe from 'react-sizeme';

// Grafana Components
import { DashboardGrid } from 'app/features/dashboard/dashgrid/DashboardGrid';

// ThingSPIN Components
import { AlarmDashboardPanel } from './AlarmDashboardPanel';

// (Customized grafana react component: iiHOC)
export class AlarmDashboardGrid extends DashboardGrid {

    // customize renderPanels method
    renderPanels() {
        const [panel] = this.props.dashboard.panels;
        const { id } = panel;
        const panelClasses = classNames({ 'react-grid-item--fullscreen': panel.fullscreen });

        panel.isInView = this.isInView(panel);

        return [<div
            key={id}
            className={panelClasses}
            id={`panel-${id}`}
            ref={elem => { this.panelRef[id] = elem; }}
        >
            <AlarmDashboardPanel
                panel={panel}
                dashboard={this.props.dashboard}
                isEditing={panel.isEditing}
                isFullscreen={panel.fullscreen}
                isInView={panel.isInView}
            />
        </div>];
    }
}

export default hot(module)(AlarmDashboardGrid);
