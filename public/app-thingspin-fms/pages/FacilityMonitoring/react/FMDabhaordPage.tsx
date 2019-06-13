import React from 'react';
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

// ThingSPIN Utils
import { tsInitDashboard } from './initDashboard';

// Facility Monitoring Component
// (Customized grafana react component: iiHOC)
export class FMDashboardPage extends DashboardPage {
    oldPanel = {};
    constructor(props) {
        super(props);
    }

    // add thingspin method
    updateFmPanel(newPanel, { removes, adds }) {
        const { dashboard } = this.props;

        for (const remove of removes) {
            dashboard.removePanel(this.oldPanel[remove]);
            delete this.oldPanel[remove];
        }

        for (const add of adds) {
            dashboard.addPanel(newPanel[add]);
            this.oldPanel[add] = newPanel[add];
        }
    }

    // add thingspin method
    onCheckedChange(siteId, tags, checked) {
        const getPanelType = (dataType: string): string => {
            switch (dataType) {
                case 'Integer':
                case 'Float':
                    return 'graph';
                default:
                    return 'table';
            }
        };

        const generatePanelData = (title: string, type: string, target: any) => ({
            // require panel data
            type,
            title,
            gridPos: { x: 0, y: 0, w: 24, h: 5 },
            // require datasource data
            datasource: "사이트 태그",
            targets: [{
                ...target,
                siteId,
                checked,
            }],
        });

        const getDiffPanel = (aPanel, bPanel) => {
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
                const panelType = getPanelType(tag.type);

                const panelData = generatePanelData(tag.Name, panelType, {
                    tagNodes: [tag],
                });
                newPanel[tag.Id] = panelData;
            }
        }

        this.updateFmPanel(newPanel, getDiffPanel(this.oldPanel, newPanel));
    }

    // Override
    render(): JSX.Element {
        const { dashboard, editview, $injector, isInitSlow, initError } = this.props;
        const { isSettingsOpening, isEditing, isFullscreen, scrollTop, updateScrollTop } = this.state;

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

        const gridWrapperClasses: string = classNames({
            'dashboard-container': true,
            'dashboard-container--has-submenu': dashboard.meta.submenuEnabled,
        });

        // Only trigger render when the scroll has moved by 25
        const approximateScrollTop: number = Math.round(scrollTop / 25) * 25;

        const rcDGNode = (<div className={gridWrapperClasses}>
            {dashboard.meta.submenuEnabled && <SubMenu dashboard={dashboard} />}
            <FMDashboardGrid
                dashboard={dashboard}
                isEditing={false}
                isFullscreen={isFullscreen}
                scrollTop={approximateScrollTop}
            />
        </div>);

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

                        {!dashboard.meta.isEditing ?
                            <div className='ts-fm-dg'>
                                <div></div> {/* 여기에 ThingSPIN Tree를 추가하면 됨 */}
                                { rcDGNode }
                            </div>
                            : rcDGNode
                        }
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
