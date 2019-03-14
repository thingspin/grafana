import React, { PureComponent } from 'react';

export interface Props {}

export interface States {
  enable: boolean;
}

export class TsToolbarComponent extends PureComponent<Props, States> {
  // private class member variables

  // public class member variables

  // protected class member variables

  constructor(props) {
    super(props);
    this.state = {
      enable: false,
    };
  }

  // common event Methods

  // get render splitted virtual DOM Methods
  get renderToolbar(): JSX.Element {
    return <div className={`ts-toolbar-component`}>hello world</div>;
  }

  // Component lifeCycle Methods
  // render 함수 호출 전 실행 함수
  // componentWillMount() {}
  // Virtual DOM을 HTML에 Rendering
  render() {
    const { enable } = this.state;
    return <>{enable ? this.renderToolbar : null}</>;
  }
  // render 함수 호출 후 실행 함수
  // componentDidMount() { }
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