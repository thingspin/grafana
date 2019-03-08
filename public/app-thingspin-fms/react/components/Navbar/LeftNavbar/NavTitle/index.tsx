import React, { PureComponent } from 'react';
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { NavModelSrv } from 'app/core/core';
import { NavModelItem } from 'app/types';

export interface Props extends TsBaseProps {}

export interface States {
  icon: string;
  menupath: string;
}

export class TsNavTitle extends PureComponent<Props, States> {
  // private class member variables
  navModelSrv: NavModelSrv;
  defaultIcon: string;
  // public class member variables

  // protected class member variables

  constructor(props) {
    super(props);
    const { $injector, $rootScope } = this.props;

    this.navModelSrv = $injector.get('navModelSrv');

    this.defaultIcon = 'fa fa-stop';
    this.state = {
      icon: this.defaultIcon,
      menupath: 'test',
    };

    $rootScope.$on('$routeChangeSuccess', (evt, data) => {
      const result = this.findPathNavItem(data.$$route);
      this.onChangeTitle(result);
    });
  }

  // common event Methods
  onChangeTitle(result: NavModelItem[]) {
    if (result) {
      const lastNavItem = result[result.length - 1],
        icon = lastNavItem.icon,
        texts = [];
      for (const nav of result) {
        texts.push(nav.text);
      }

      this.setState({
        icon: icon ? icon : this.defaultIcon,
        menupath: texts.join(' > '),
      });
    } else {
      this.setState({
        icon: 'fa fa-fw fa-warning',
        menupath: 'Page not found',
      });
    }
  }

  // get render splitted virtual DOM Methods
  get renderTitle() {
    return (
      <>
        <div className={'ts-nav-title-icon'}>
          <i className={this.state.icon} />
        </div>
        <div>{this.state.menupath}</div>
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
  componentDidMount() {
    const result = this.findPathNavItem(this.currentRoute);
    this.onChangeTitle(result);
  }
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

  get currentRoute() {
    return this.props.$route.current;
  }

  get navItems(): NavModelItem[] {
    return this.navModelSrv.navItems;
  }

  findPathNavItem(route) {
    if (!route) {
      return null;
    }

    const items = this.navItems;
    const { originalPath } = route;

    // parent iterator
    for (const item of items) {
      if (item.url === originalPath && item.id !== 'divider') {
        return [item];
      }

      // children iterator
      if (item.children && item.children.length) {
        for (const childItem of item.children) {
          if (childItem.url === originalPath && childItem.id !== 'divider') {
            return [item, childItem];
          }
        }
      }
    }
    return null;
  }
}
