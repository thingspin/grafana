// 3rd party libs
import React, { ReactNode } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import classNames from 'classnames';

// Grafana React Components
import { DashboardPage, mapStateToProps } from 'app/features/dashboard/containers/DashboardPage';
import { SubMenu } from 'app/features/dashboard/components/SubMenu';
import { CustomScrollbar } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

// Grafana Redux
import { cleanUpDashboard } from 'app/features/dashboard/state/actions';
import { updateLocation } from 'app/core/actions';
import { notifyApp } from 'app/core/actions';

// Grafana libs
import { getTimeSrv } from 'app/features/dashboard/services/TimeSrv';


// ThingSPIN React Components
import FMNav from './FMNav';
import FMSettings from './FMSettings';
import FMLeftTree from './FMLeftTree';
import { FMDashboardGrid } from './FMDashboardGrid';

// ThingSPIN Utils
import { tsInitDashboard } from './initDashboard';
import { FMDashboardModel } from '../models';

// Facility Monitoring Component
// (Customized grafana react component: iiHOC)
export class FMDashboardPage extends DashboardPage {
    panelType = 'graph';

    // add thingspin method
    updateFmPanel(newPanel: any[]): void {
        const { dashboard } = this.props;

        // remove phase
        const panels = [...dashboard.panels];
        for (const panel of panels) {
            dashboard.removePanel(panel);
        }

        // add panels
        for (const panel of newPanel) {
            dashboard.addPanel(panel);
        }

        const timeSrv = getTimeSrv();
        timeSrv.refreshDashboard();
    }

    // add thingspin method
    onCheckedChange(siteId: any, tags: any) {
        // local method
        const generatePanelData = (title: string, type: string, target: any, y = 0): object => ({
            // require panel data
            type,
            title,
            aliasColors: {
                [target.tagNodes[0].label]: 'light-blue',
            },
            nullPointMode: "connected",
            gridPos: { x: 0, y, w: 24, h: 5 },

            // require datasource data
            datasource: "사이트 태그",
            targets: [{
                ...target,
                siteId,
            }],
        });

        const newPanels = tags.map((tag: any) => generatePanelData(tag.label, this.panelType || 'graph', {
            tagNodes: [tag],
            checked: [tag.value],
        }));
        this.updateFmPanel(newPanels);
    }

    onClickFacilityTree = (site: any, tags: any) => {
        this.setFacilityInfo(site, tags);
        this.onCheckedChange(site.value, tags);
    };

    onPanelTypeChange = ({ value }: SelectableValue<string>) => {
        this.panelType = value;
    };

    renderFacilityTree(): ReactNode {
        const dashboard = this.props.dashboard as FMDashboardModel;
        const { $injector } = this.props;

        return <FMLeftTree
            $injector={$injector}
            dashboard={dashboard}
            // Events
            onChangeFacilityTree={this.onClickFacilityTree}
            onPanelTypeChange={this.onPanelTypeChange}
        />;
    }

    // add thingspin method
    renderGridNode(): ReactNode {
        const { editview } = this.props;
        const { isFullscreen, scrollTop } = this.state;
        const dashboard = this.props.dashboard as FMDashboardModel;
        const { submenuEnabled, isEditing } = dashboard.meta;

        const gridClassName = classNames({
            'ts-fm-dg': !isEditing,
            'ts-fm-edit': !!isEditing,
        });

        const gridWrapperClasses: string = classNames({
            'dashboard-container': true,
            'dashboard-container--has-submenu': submenuEnabled,
        });

        // Only trigger render when the scroll has moved by 25
        const approximateScrollTop: number = Math.round(scrollTop / 25) * 25;
        return (<div className={gridClassName}>

            {!isEditing && !editview && this.renderFacilityTree()}

            <div className={gridWrapperClasses}>
                {submenuEnabled && <SubMenu dashboard={dashboard} />}

                <FMDashboardGrid
                    dashboard={dashboard}
                    isEditing={false}
                    isFullscreen={isFullscreen}
                    scrollTop={approximateScrollTop}
                />
            </div>
        </div>);
    }

    setFacilityInfo(site: any, facilityTags: any) {
        const dashboard = this.props.dashboard as FMDashboardModel;
        if (!dashboard) {
            return;
        }

        dashboard.site = site;
        dashboard.facilityTags = facilityTags;
    }

    // Override
    render(): JSX.Element {
        const { dashboard, editview, $injector, isInitSlow, initError } = this.props;
        const { isSettingsOpening, isEditing, isFullscreen, updateScrollTop } = this.state;

        if (!dashboard) {
            return isInitSlow ? this.renderSlowInitState() : null;
        }

        const classes: string = classNames({
            'dashboard-page--settings-opening': isSettingsOpening,
            'dashboard-page--settings-open': !isSettingsOpening && editview,
        });

        return (
            <div className={classes}>
                <FMNav
                    dashboard={dashboard}
                    isEditing={isEditing}
                    isFullscreen={isFullscreen}
                    editview={editview}
                    $injector={$injector}
                    onAddPanel={this.onAddPanel}
                />

                <div className="scroll-canvas scroll-canvas--dashboard">
                    <CustomScrollbar
                        autoHeightMin="100%"
                        setScrollTop={this.setScrollTop}
                        scrollTop={updateScrollTop}
                        updateAfterMountMs={500}
                        className="custom-scrollbar--page"
                    >
                        {editview && <FMSettings dashboard={dashboard} />}

                        {initError && this.renderInitFailedState()}

                        {this.renderGridNode()}
                    </CustomScrollbar>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = {
    initDashboard: tsInitDashboard,
    cleanUpDashboard,
    notifyApp,
    updateLocation,
};

export default hot(module)(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(FMDashboardPage)
);
