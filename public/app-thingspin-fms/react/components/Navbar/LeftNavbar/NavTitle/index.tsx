import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import config from 'app/core/config';
import { NavModelSrv } from 'app/core/core';
import { StoreState, DashboardInitPhase } from 'app/types';
import { DashboardModel } from 'app/features/dashboard/state';
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { NavModelItem } from '@grafana/data';

export interface Props extends TsBaseProps {
  icon?: string;
  menupath?: string[];
  isFullpathTitle?: boolean;
  initPhase?: DashboardInitPhase;
  dashboard?: DashboardModel | null;
}

export interface States extends StoreState {
  isFullpathTitle: boolean;
}

export class TsNavTitle extends PureComponent<Props, States> {
  navModelSrv: NavModelSrv;
  defaultIcon: string;

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

  render() {
    return <div className="ts-nav-title">{this.renderTitle}</div>;
  }

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
}

export const findPathNavItem = (path: string, navIndex: any) => {
  for (const id in navIndex) {
    const item = navIndex[id];
    if (item.url === path && id !== 'divider') {
      return [item];
    }

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
    let originalPath = $$route.originalPath;
    if ($$route.keys.length > 0) {
      const loc = new URL(window.location.href);
      originalPath = loc.pathname;
    }
    if ($$route) {
      if ($$route.routeInfo) {
        titleObj = $$route.routeInfo;
      } else {
        let list = findPathNavItem(originalPath, config.bootData.thingspin.menu);
        let subPath = originalPath;
        while (list===null) {
          const lastIdx = subPath.lastIndexOf('/');
          if ( lastIdx <= 0 ) {
            break;
          }
          subPath = subPath.substring(0,lastIdx);
          list = findPathNavItem(subPath, config.bootData.thingspin.menu);
        }
        if ( list ) {
          titleObj = getTitle(list);
        } else {
          titleObj = getTitle(undefined);
        }
      }
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
