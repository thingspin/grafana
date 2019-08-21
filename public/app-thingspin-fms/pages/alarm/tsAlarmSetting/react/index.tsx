// 3rd party libs
import React, { PureComponent, ReactNode } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Grafana React Components
import {
    mapStateToProps,
    Props as GfDPProps // Grafana Dashboard Page Props
} from 'app/features/dashboard/containers/DashboardPage';
import AlarmDashboardPage from './AlarmDashboardPage';

export interface Props extends GfDPProps { }

export class AlarmSettingComponent extends PureComponent<Props> {
    render(): ReactNode {
        return (
            <div className="panel-in-fullscreen">
                <AlarmDashboardPage {...this.props} />
            </div>
        );
    }
}

export default hot(module)(connect( mapStateToProps, )(AlarmSettingComponent));
