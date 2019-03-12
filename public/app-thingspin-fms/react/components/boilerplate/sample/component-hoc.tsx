import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import { TsComponentNameComponent } from './component-base';

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TsComponentNameComponent)
);
