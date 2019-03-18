import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { NavModelSrv } from 'app/core/core';
import { NavModelItem, StoreState } from 'app/types';

export interface Props extends TsBaseProps {
  // redux data
  icon: string;
  menupath: string[];
  isFullpathTitle: boolean;
}

export interface States {
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
    const { menupath } = this.props;
    return (
      <>
        <div className={'ts-nav-title-icon'}>
          <i className={this.props.icon} />
        </div>
        <div>{this.props.isFullpathTitle ? menupath.join(' > ') : menupath[menupath.length - 1]}</div>
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
export const findPathNavItem = (path: string, s: StoreState) => {
  const { navIndex } = s;

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

export const getTitle = list => {
  let retValue: any = {};

  if (list) {
    const lastNavItem: NavModelItem = list[list.length - 1],
      icon = lastNavItem.icon,
      texts = [];

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
  const { $$route } = $route.current;
  let titleObj: any;
  if ($$route) {
    const list = findPathNavItem($$route.originalPath, state);

    titleObj = getTitle(list);
  } else {
    titleObj = getTitle(undefined);
  }
  return {
    ...titleObj,
    isFullpathTitle: state.thingspinNavbar.isFullpathTitle,
  };
};

export default hot(module)(connect(mapStateToProps)(TsNavTitle));
