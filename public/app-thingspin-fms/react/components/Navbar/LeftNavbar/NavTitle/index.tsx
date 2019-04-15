import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { NavModelSrv } from 'app/core/core';
import { NavModelItem, StoreState, DashboardInitPhase } from 'app/types';
import { DashboardModel } from 'app/features/dashboard/state';

export interface Props extends TsBaseProps {
  // redux data
  icon: string;
  menupath: string[];
  isFullpathTitle: boolean;
  initPhase: DashboardInitPhase;
  dashboard: DashboardModel | null;
}

export interface States extends StoreState {
  isFullpathTitle: boolean;
}

export class TsNavTitle extends PureComponent<Props, States> {
  // private class member variables
  navModelSrv: NavModelSrv;
  defaultIcon: string;
  // public class member variables

  // protected class member variables

  constructor(props) {
    super(props);
  }

  // common event Methods

  // get render splitted virtual DOM Methods
  get renderTitle() {
    const { menupath, dashboard, initPhase } = this.props;
    let title = '';
    let icon = this.props.icon;

    if ( menupath ) {
      title = this.props.isFullpathTitle && menupath !== undefined ? menupath.join(' > ') : menupath[menupath.length - 1];
    } else {
      if ( initPhase === DashboardInitPhase.Completed) {
        if ( dashboard ) {
          title = dashboard.title;
          if ( !icon ) {
            icon = 'fa fa-fw fa-television';
          }
        }
      }
    }

    return (
      <>
        <div className={'ts-nav-title-icon'}><i className={icon} /></div>
        <div>{title}</div>
      </>
    );
  }

  // Component lifeCycle Methods
  // render 함수 호출 전 실행 함수
  // componentWillMount() {}
  // Virtual DOM을 HTML에 Rendering
  render() {
    return <div className="ts-nav-title">{this.renderTitle}</div>;
  }

  // render 함수 호출 후 실행 함수
  componentDidMount() {}
  // prop을 새로 받았을 때 실행 함수
  // componentWillReceiveProps() {}
  // prop or state 변경시 재렌더링 여부 결정 함수
  // shouldComponentUpdate() {}
  // 컴포넌트 업데이트(재렌더링) 전 실행 함수
  // componentWillUpdate() {}
  // 컴포넌트 재렌더링 후 실행 함수
  // componentDidUpdate() {}
  // DOM에 재거 후 실행 함수
  // componentWillUnmount() { }

  // util Methods
}

// util methods
export const findPathNavItem = (path: string, { navIndex }: StoreState) => {
  // parent iterator
  for (const id in navIndex) {
    const item = navIndex[id];
    if (item.url === path && id !== 'divider') {
      return [item];
    }

    // children iterator
    if (item.children && item.children.length) {
      for (const childItem of item.children) {
        if (childItem.url === path && childItem.id !== 'divider') {
          return [item, childItem];
        }
      }
    }
  }
  return null;
};

export const getTitle = (list: NavModelItem[] | undefined) => {
  let retValue: { icon?: string; menupath?: string[] } = {};

  if (list) {
    const lastNavItem: NavModelItem = list[list.length - 1],
      icon: string = lastNavItem.icon,
      texts: string[] = [];

    for (const nav of list) {
      texts.push(nav.text);
    }

    retValue = {
      icon: icon ? icon : 'fa fa-stop',
      menupath: texts,
    };
  } else {
    retValue = {
      icon: 'fa fa-fw fa-warning',
      menupath: ['Page not found'],
    };
  }
  return retValue;
};

export const mapStateToProps = (state, { $route }) => {
  let titleObj: any;
  if (!$route.current) {
    titleObj = getTitle(undefined);
  } else {
    const { $$route } = $route.current;
    if ($$route) {
      const list = findPathNavItem($$route.originalPath, state);
      titleObj = getTitle(list);
    } else {
      titleObj = getTitle(undefined);
    }
  }

  return {
    ...titleObj,
    isFullpathTitle: state.thingspinNavbar.isFullpathTitle,
    dashboard: state.dashboard.model,
    initPhase: state.dashboard.initPhase,
  };
};

export default hot(module)(connect(mapStateToProps)(TsNavTitle));
