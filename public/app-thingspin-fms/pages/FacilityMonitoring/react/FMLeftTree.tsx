import React, { PureComponent } from 'react';
import { auto } from 'angular';
import { FMDashboardModel } from '../models/index';
import { FMVizTypeSelector } from './FMVIzTypeSelector';
import { SelectOptionItem } from '@grafana/ui';
import FacilityTree from 'app-thingspin-fms/react/components/FacilityNodeTree';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

interface Props {
    $injector: auto.IInjectorService;
    dashboard: FMDashboardModel;
    onChangeFacilityTree: (site, tags) => void;
    onPanelTypeChange: (item: SelectOptionItem<string>) => void;

    isTreeView?: boolean;
}

interface States {
}

export class FMLeftTree extends PureComponent<Props, States> {
    constructor(props) {
        super(props);
    }

    setFacilityInfo(site, facilityTags) {
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
        const dashboard = this.props.dashboard as FMDashboardModel;
        const { $injector, isTreeView } = this.props;

        return (<>{isTreeView ? <div className="fm-left-tree">
            <div className="fm-left-type-selector">
                <FMVizTypeSelector onChange={this.props.onPanelTypeChange.bind(this)} />
            </div>
            <FacilityTree taginfo={dashboard.facilityTags} siteinfo={dashboard.site}
                inject={$injector} click={this.onClickFacilityTree.bind(this)} />
        </div> : ''}</>);
    }
}

export const mapStateToProps = (state) => ({
    isTreeView: state.thingspinFmMeta.isTreeView,
});

export default hot(module)(
    connect(
        mapStateToProps, {}
    )(FMLeftTree)
);
