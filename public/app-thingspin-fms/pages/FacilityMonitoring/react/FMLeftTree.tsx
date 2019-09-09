import React from 'react';
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

// Presentational Component
export const FMLeftTree: React.FC<Props> = (props: Props) => {
    const dashboard: FMDashboardModel = props.dashboard as FMDashboardModel;
    const { $injector, isTreeView } = props;

    return <>
        {isTreeView && <div className="fm-left-tree">
            <div className="fm-left-type-selector">
                <FMVizTypeSelector onChange={props.onPanelTypeChange} />
            </div>

            <FacilityTree taginfo={dashboard.facilityTags}
                siteinfo={dashboard.site}
                inject={$injector}
                // Events
                click={ ({ siteData, Taginfo }: any) => props.onChangeFacilityTree(siteData, Taginfo) }
            />
        </div>}
    </>;
};

export const mapStateToProps = (state: any) => ({
    isTreeView: state.thingspinFmMeta.isTreeView,
});

export default hot(module)(
    connect(
        mapStateToProps, {}
    )(FMLeftTree)
);
