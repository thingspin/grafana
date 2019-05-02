import { TsConfigs } from './index';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connectWithStore(TsConfigs, mapStateToProps, mapDispatchToProps);
