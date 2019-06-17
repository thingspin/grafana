// 3rd party libs
import React, { PureComponent, ReactNode } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Grafana React Components
import {
    mapStateToProps,
    Props as GfDPProps
} from 'app/features/dashboard/containers/DashboardPage';

// thingspin react components
import FMDashboardPage from './FMDashboardPage';

// styler(scss, css)
import './_index.scss';

export interface Props extends GfDPProps {

}

export interface State {

}

export class FMComponent extends PureComponent<Props, State> {
    constructor(props) {
        super(props);
    }

    render(): ReactNode {
        return (<FMDashboardPage {...this.props}></FMDashboardPage>);
    }
}

export default hot(module)(connect( mapStateToProps, )(FMComponent));
