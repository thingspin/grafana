// 3rd party libs
import React, { ReactNode } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import classNames from 'classnames';

// Grafana React Components
import { DashboardPage, mapStateToProps } from 'app/features/dashboard/containers/DashboardPage';

// Grafana Redux
import { cleanUpDashboard } from 'app/features/dashboard/state/actions';
import { notifyApp } from 'app/core/actions';

// ThingSPIN React Components
import AlarmDashNav from './AlarmDashNav';
import { AlarmDashboardGrid } from './AlarmDashboardGrid';

// ThingSPIN Utils
import { tsInitDashboard as initDashboard } from './initDashboard';

// Alarm Monitoring Component
// (Customized grafana react component: iiHOC)
export class AlarmDashboardPage extends DashboardPage {

    // add thingspin method
    renderGridNode(): ReactNode {
        const { dashboard } = this.props;
        const { isFullscreen } = this.state;

        const gridWrapperClasses: string = classNames({
            'dashboard-container': true,
            'dashboard-container--has-submenu': dashboard.meta.submenuEnabled,
        });

        // Only trigger render when the scroll has moved by 25
        return <div className={gridWrapperClasses}>
            <AlarmDashboardGrid
                dashboard={dashboard}
                isEditing={true}
                isFullscreen={isFullscreen}
                scrollTop={0}
            />
        </div>;
    }

    // Override
    render(): JSX.Element {
        const { dashboard, editview, $injector, isInitSlow, initError } = this.props;
        const { isSettingsOpening, isEditing, isFullscreen } = this.state;

        if (!dashboard) {
            return isInitSlow ? this.renderSlowInitState() : null;
        }

        const classes: string = classNames({
            'dashboard-page--settings-opening': isSettingsOpening,
            'dashboard-page--settings-open': !isSettingsOpening && editview,
        });

        return (
            <div className={classes}>

                <AlarmDashNav
                    dashboard={dashboard}
                    isEditing={isEditing}
                    isFullscreen={isFullscreen}
                    editview={editview}
                    $injector={$injector}
                    onAddPanel={this.onAddPanel}
                />

                <div className="scroll-canvas scroll-canvas--dashboard">
                    {initError && this.renderInitFailedState()}

                    {this.renderGridNode()}
                </div>

            </div>
        );
    }
}

export const mapDispatchToProps = {
    initDashboard,
    cleanUpDashboard,
    notifyApp,
};

export default hot(module)(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(AlarmDashboardPage)
);
