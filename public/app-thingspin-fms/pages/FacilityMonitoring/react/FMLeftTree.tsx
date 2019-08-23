import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import { SelectableValue } from '@grafana/data';

import FacilityTree from 'app-thingspin-fms/react/components/FacilityNodeTree';

import { FMDashboardModel } from '../models/index';
import { FMVizTypeSelector } from './FMVIzTypeSelector';

interface Props {
    $injector: angular.auto.IInjectorService;
    dashboard: FMDashboardModel;
    onChangeFacilityTree: (site: any, tags: any) => void;
    onPanelTypeChange: (item: SelectableValue<string>) => void;

    isTreeView?: boolean;
}

interface States {
}

export class FMLeftTree extends PureComponent<Props, States> {
    setFacilityInfo(site: any, facilityTags: any) {
        const { dashboard } = this.props;
        if (!dashboard) {
            return;
        }

        dashboard.site = site;
        dashboard.facilityTags = facilityTags;
    }

    onClickFacilityTree(data: any) {
        const { Taginfo: tags, siteData: site } = data;
        this.props.onChangeFacilityTree(site, tags);
    }

    render() {
        const dashboard: FMDashboardModel = this.props.dashboard as FMDashboardModel;
        const { $injector, isTreeView } = this.props;

        return <>
            {isTreeView && <div className="fm-left-tree">
                <div className="fm-left-type-selector">
                    <FMVizTypeSelector onChange={this.props.onPanelTypeChange.bind(this)} />
                </div>

                <FacilityTree taginfo={dashboard.facilityTags}
                    siteinfo={dashboard.site}
                    inject={$injector}
                    click={this.onClickFacilityTree.bind(this)}
                />
            </div>}
        </>;
    }
}

export const mapStateToProps = (state: any) => ({
    isTreeView: state.thingspinFmMeta.isTreeView,
});

export default hot(module)(
    connect(
        mapStateToProps, {}
    )(FMLeftTree)
);

