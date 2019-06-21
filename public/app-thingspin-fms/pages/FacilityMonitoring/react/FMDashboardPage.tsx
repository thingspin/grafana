import React, { ReactNode } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import classNames from 'classnames';

// Grafana React Components
import { DashboardPage, mapStateToProps } from 'app/features/dashboard/containers/DashboardPage';
import { SubMenu } from 'app/features/dashboard/components/SubMenu';
import { CustomScrollbar } from '@grafana/ui';

// Grafana Redux
import { cleanUpDashboard } from 'app/features/dashboard/state/actions';
import { updateLocation } from 'app/core/actions';
import { notifyApp } from 'app/core/actions';

// ThingSPIN React Components
import FMNav from './FMNav';
import FMSettings from './FMSettings';
import { FMDashboardGrid } from './FMDashboardGrid';
import FacilityTree from 'app-thingspin-fms/react/components/FacilityNodeTree';

// ThingSPIN Utils
import { tsInitDashboard } from './initDashboard';
import { FMDashboardModel } from '../models';

interface FmPanelFilter {
    removes: any;
    adds: any;
}

// Facility Monitoring Component
// (Customized grafana react component: iiHOC)
export class FMDashboardPage extends DashboardPage {
    oldPanel = {}; // panel cache data
    constructor(props) {
        super(props);
    }

    // add thingspin method
    updateFmPanel(newPanel, { removes, adds }: FmPanelFilter) {
        const { dashboard } = this.props;

        // remove panels
        for (const remove of removes) {
            const { id } = this.oldPanel[remove]; // auto generated in dashboardModel class

            // find PanelModel Object
            const p = dashboard.getPanelById(id);
            dashboard.removePanel(p);

            delete this.oldPanel[remove];
        }

        // add panels
        for (const add of adds) {
            dashboard.addPanel(newPanel[add]);
            this.oldPanel[add] = newPanel[add];
        }
    }

    // add thingspin method
    onCheckedChange(siteId, tags) {
        // local method
        const getPanelType = (dataType: string): string => {
            switch (dataType.toLowerCase()) {
                case 'integer':
                case 'float':
                    return 'graph';
                default:
                    return 'table';
            }
        };

        // local method
        const generatePanelData = (title: string, type: string, target: any, y = 0): object => ({
            // require panel data
            type,
            title,
            gridPos: { x: 0, y, w: 24, h: 5 },

            // require datasource data
            datasource: "사이트 태그",
            targets: [{
                ...target,
                siteId,
            }],
        });

        // local method
        const getDiffPanel = (aPanel: object, bPanel: object): FmPanelFilter => {
            // local method
            const diffKeys = (A: any[], B: any[]) => (A.filter(x => !B.includes(x)));

            const oldKeys = Object.keys(aPanel);
            const newKeys = Object.keys(bPanel);

            const removes = diffKeys(oldKeys, newKeys);
            const adds = diffKeys(newKeys, oldKeys);

            return {
                removes,
                adds,
            };
        };


        const newPanel = {};
        if (Array.isArray(tags)) {
            for (const tag of tags) {
                const panelType = getPanelType(tag.tag_column_type);

                const panelData = generatePanelData(tag.tag_name, panelType, {
                    tagNodes: [tag],
                    checked: [tag.value],
                });
                newPanel[tag.tag_id] = panelData;
            }
        }

        this.updateFmPanel(newPanel, getDiffPanel(this.oldPanel, newPanel));
    }

    onClickFacilityTree(data: any) {
        const {Taginfo: tags, siteData: site} = data;
        this.setFacilityInfo(site, tags);
        this.onCheckedChange(site.value, tags);
    }

    // add thingspin method
    renderGridNode(): ReactNode {
        const { $injector, editview } = this.props;
        const dashboard = this.props.dashboard as FMDashboardModel;
        const { isFullscreen, scrollTop } = this.state;

        const gridClassName = classNames({
            'ts-fm-dg': !dashboard.meta.isEditing,
            'ts-fm-edit': !!dashboard.meta.isEditing,
        });

        const gridWrapperClasses: string = classNames({
            'dashboard-container': true,
            'dashboard-container--has-submenu': dashboard.meta.submenuEnabled,
        });

        // Only trigger render when the scroll has moved by 25
        const approximateScrollTop: number = Math.round(scrollTop / 25) * 25;
        return (<div className={gridClassName}>

            {!dashboard.meta.isEditing && !editview
                ? <FacilityTree taginfo={dashboard.facilityTags} siteinfo={dashboard.site}
                    inject={$injector} click={this.onClickFacilityTree.bind(this)}/> : ''}

            <div className={gridWrapperClasses}>
                {dashboard.meta.submenuEnabled && <SubMenu dashboard={dashboard} />}

                <FMDashboardGrid
                    dashboard={dashboard}
                    isEditing={false}
                    isFullscreen={isFullscreen}
                    scrollTop={approximateScrollTop}
                />
            </div>
        </div>);
    }

    setFacilityInfo(site, facilityTags) {
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
            if (isInitSlow) {
                return this.renderSlowInitState();
            }
            return null;
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
