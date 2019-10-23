// 3rd party libs
import React from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Grafana React Components
import {
    mapStateToProps,
    Props as GfDPProps
} from 'app/features/dashboard/containers/DashboardPage';

// thingspin react components
import FMDashboardPage from './FMDashboardPage';

export interface Props extends GfDPProps {

}

export const FMComponent: React.FC<Props> = (props: Props) => (
    <FMDashboardPage {...props}></FMDashboardPage>
);

export default hot(module)(connect( mapStateToProps, )(FMComponent));
