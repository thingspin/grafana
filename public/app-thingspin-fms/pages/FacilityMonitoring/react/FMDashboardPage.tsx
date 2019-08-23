// 3rd party libs
import React, { ReactNode } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import classNames from 'classnames';

// Grafana React Components
import { DashboardPage, mapStateToProps, Props } from 'app/features/dashboard/containers/DashboardPage';
import { SubMenu } from 'app/features/dashboard/components/SubMenu';
import { CustomScrollbar } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

// Grafana Redux
import { cleanUpDashboard } from 'app/features/dashboard/state/actions';
import { updateLocation } from 'app/core/actions';
import { notifyApp } from 'app/core/actions';

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

    constructor(props: Props) {
        super(props);

        this.onClickFacilityTree = this.onClickFacilityTree.bind(this);
        this.onPanelTypeChange = this.onPanelTypeChange.bind(this);
    }

    // add thingspin method
    updateFmPanel(newPanel: any[]): void {
        const { dashboard } = this.props;

        // remove panels(non diff check)
        const removes = dashboard.panels.map(({ id }) => (id));
        for (const remove of removes) {
            // const id = this.oldPanel[remove].id || remove ; // auto generated in dashboardModel class

            // find PanelModel Object
            const p = dashboard.getPanelById(remove);

            // remove phase
            dashboard.removePanel(p);
            // delete this.oldPanel[remove];
        }

        // add panels
        for (const add of newPanel) {
            dashboard.addPanel(add);
        }
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

        // local method
        /*
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
        */


        const newPanels = tags.map((tag: any) => (generatePanelData(tag.label,
            this.panelType || 'graph', {
                tagNodes: [tag],
                checked: [tag.value],
            }
        )));

        this.updateFmPanel(newPanels);
    }

    onClickFacilityTree(site: any, tags: any) {
        this.setFacilityInfo(site, tags);
        this.onCheckedChange(site.value, tags);
    }

    onPanelTypeChange({ value }: SelectableValue<string>) {
        this.panelType = value;
    }


    renderFacilityTree(): ReactNode {
        const dashboard = this.props.dashboard as FMDashboardModel;
        const { $injector } = this.props;

        return (<FMLeftTree $injector={$injector} dashboard={dashboard}
            onChangeFacilityTree={this.onClickFacilityTree}
            onPanelTypeChange={this.onPanelTypeChange}
        />);
    }

    // add thingspin method
    renderGridNode(): ReactNode {
        const { editview } = this.props;
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

            {!dashboard.meta.isEditing && !editview ? this.renderFacilityTree() : ''}

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
