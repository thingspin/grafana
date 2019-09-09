// 3rd party libs
import React, { FC } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Grafana React Components
import {
    mapStateToProps,
    Props as GfDPProps // Grafana Dashboard Page Props
} from 'app/features/dashboard/containers/DashboardPage';
import AlarmDashboardPage from './AlarmDashboardPage';

export interface Props extends GfDPProps { }

export const AlarmSettingComponent: FC<Props> = (props: Props): JSX.Element => (
    <div className="panel-in-fullscreen">
        <AlarmDashboardPage {...props} />
    </div>
);

export default hot(module)(connect(mapStateToProps)(AlarmSettingComponent));
