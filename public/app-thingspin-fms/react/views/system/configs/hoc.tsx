import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import { TsConfigs } from './index';

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TsConfigs)
);
