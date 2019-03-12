import { TsComponentNameComponent } from './component-base';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connectWithStore(TsComponentNameComponent, mapStateToProps, mapDispatchToProps);
