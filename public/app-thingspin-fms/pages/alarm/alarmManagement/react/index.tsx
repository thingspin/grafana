// 3rd party libs
import React from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Grafana libs
import { StoreState, AlertRule } from 'app/types';

import { getNavModel } from 'app/core/selectors/navModel';

import { getAlertRuleItems, getSearchQuery } from 'app/features/alerting/state/selectors';

import { AlertRuleList } from 'app/features/alerting/AlertRuleList';

import { getAlertRulesAsync, setSearchQuery, togglePauseAlertRule } from 'app/features/alerting/state/actions';
import { updateLocation } from 'app/core/actions';

// Thingspin libs
// Views
import AlarmMgmtBaseLayer from './BaseLayer';
import TsContainer from '../../common/react/TsContainer';
import TopButton from './TopButton';
import TsAlarmRuleItem from './TsAlarmRuleItem';
import TsAlarmSearch from './TsAlarmSearch';

// iiHOC(extended AlertRuleList)
export class TsAlarmRuleList extends AlertRuleList {
  search = '';
  searchState = '';

  // Thingspin new method
  gotoAddPage = () => this.props.updateLocation({ path: '/thingspin/alarm/new' });

  // Thingspin new method
  getButtons = (): React.ReactNode[] => [
    <TopButton onClick={this.gotoAddPage}>알람 추가</TopButton>,
  ];

  onChange = (search: string, state: string) => {
    this.search = search;
    this.searchState = state;
    this.forceUpdate();
  }

  dataFiltering = (rule: AlertRule): boolean => !(
    (this.searchState && (this.searchState !== rule.state)) // state search
    || (this.search && (!rule.name.includes(this.search))) // text search
  );

  // override(Render Hijacking)
  render() {
    const { alertRules } = this.props;

    return (<AlarmMgmtBaseLayer buttons={this.getButtons()} title='알람 관리' titleIcon='fa fa-info' >
      <TsContainer headerLeft='알람 룰'>
        <TsAlarmSearch onChange={this.onChange}></TsAlarmSearch>
        <section>
          <ol className='alert-rule-list'>
            {alertRules.filter(this.dataFiltering)
              .map(rule => (<TsAlarmRuleItem
                rule={rule}
                key={rule.id}
                search={this.search}
                onTogglePause={() => this.onTogglePause(rule)}
              />
              ))}
          </ol>
        </section>
      </TsContainer>
    </AlarmMgmtBaseLayer>);
  }
}

export const mapStateToProps = (state: StoreState) => ({
  navModel: getNavModel(state.navIndex, 'alert-list'),
  alertRules: getAlertRuleItems(state.alertRules),
  stateFilter: state.location.query.state,
  search: getSearchQuery(state.alertRules),
  isLoading: state.alertRules.isLoading,
});

export const mapDispatchToProps = {
  updateLocation,
  getAlertRulesAsync,
  setSearchQuery,
  togglePauseAlertRule,
};

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TsAlarmRuleList)
);
