// 3rd party libs
import React from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

// Grafana libs
import { StoreState } from 'app/types';

import { getNavModel } from 'app/core/selectors/navModel';

import { getAlertRuleItems, getSearchQuery } from 'app/features/alerting/state/selectors';

import { AlertRuleList } from "app/features/alerting/AlertRuleList";

import { getAlertRulesAsync, setSearchQuery, togglePauseAlertRule } from 'app/features/alerting/state/actions';
import { updateLocation } from 'app/core/actions';

// Thingspin libs
// Views
import AlarmMgmtBaseLayer from './BaseLayer';
import TsContainer from './TsContainer';
import TopButton from './TopButton';
import TsAlarmRuleItem from './TsAlarmRuleItem';

// iiHOC(extended AlertRuleList)
export class TsAlarmRuleList extends AlertRuleList {

  // Thingspin new method
  gotoAddPage = () => {
    this.props.updateLocation({ path: '/thingspin/alarm/new' });
  }

  // Thingspin new method
  getButtons(): React.ReactNode[] {
    return [
      (<TopButton onClick={this.gotoAddPage}>알람 추가</TopButton>),
    ];
  }

  // override(Render Hijacking)
  render() {
    const { alertRules, search } = this.props;

    return (<AlarmMgmtBaseLayer buttons={this.getButtons()} title="알람 관리" titleIcon="fa fa-info" >
      <TsContainer headerLeft={"알람 룰"}>
        <section>
            <ol className="alert-rule-list">
              {alertRules.map(rule => (<TsAlarmRuleItem
                  rule={rule}
                  key={rule.id}
                  search={search}
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
