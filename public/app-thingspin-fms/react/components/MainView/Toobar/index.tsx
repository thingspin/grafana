import React, { PureComponent } from 'react';
import { updateLocation } from 'app/core/actions';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';
import { TsToolbarPayload, ToolbarItem } from 'app-thingspin-fms/react/redux/reducers/toolbar';
import { appEvents } from 'app/core/core';

export interface Props {
  kiosk: any;
  thingspinToolbar: TsToolbarPayload;
  updateLocation: typeof updateLocation;
}

export class TsToolbarComponent extends PureComponent<Props> {
  // private class member variables

  // public class member variables

  // protected class member variables

  constructor(props) {
    super(props);
  }

  // common event Methods

  // get render splitted virtual DOM Methods

  get renderCompressButton(): JSX.Element {
    const onCompressEvt = () => {
      appEvents.emit('ts-change-viewmode', 0);
    };
    return (
      <button className={`btn reduct-btn`} onClick={onCompressEvt}>
        <i className={`fa fa-compress`} />
      </button>
    );
  }
  get renderToolbar(): JSX.Element {
    const { list }: TsToolbarPayload = this.props.thingspinToolbar;

    return (
      <div className={`ts-toolbar-component`}>
        <div className={`ts-toolbar-wrap`}>
          <div className={`ts-toolbar-items`}>
            {list.map(({ link, icon, title }: ToolbarItem, index: number) => {
              const onClickEvt = () => {
                this.props.updateLocation({ path: link });
              };

              return (
                <button className={`ts-toobar-link`} key={`ts-toolbar-item-${index}`} onClick={onClickEvt}>
                  <i className={icon} /> {title}
                </button>
              );
            })}
          </div>
          {this.renderCompressButton}
        </div>
      </div>
    );
  }

  // Component lifeCycle Methods
  // render 함수 호출 전 실행 함수
  // componentWillMount() {}
  // Virtual DOM을 HTML에 Rendering
  render() {
    const {
      kiosk,
      thingspinToolbar: { enable },
    }: Props = this.props;
    const ngViewDiv: JQuery = $('#ts-ng-view');

    ngViewDiv.toggleClass('ts-ng-view', enable);
    return <>{(kiosk === '1' || kiosk === true) && enable ? this.renderToolbar : null}</>;
  }
  // render 함수 호출 후 실행 함수
  // componentDidMount() {}
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

const mapStateToProps = (state: any) => ({
  thingspinToolbar: state.thingspinToolbar,
  kiosk: state.thingspinNavbar.kiosk,
});

const mapDispatchToProps = {
  updateLocation,
};

export default connectWithStore(TsToolbarComponent, mapStateToProps, mapDispatchToProps);
