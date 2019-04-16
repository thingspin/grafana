import React, { PureComponent, SyntheticEvent } from 'react';
import * as m from '../types';

import { appEvents } from 'app/core/core';
import { getBackendSrv } from 'app/core/services/backend_srv';

interface PropsSystemControl {
    item: m.Item;
}

interface StatesSystemControl {
}

export class SystemControl extends PureComponent<PropsSystemControl, StatesSystemControl> {
    render() {
        const { tag, attribute } = this.props.item;

        return (
            <>
            <div key={ tag + "." + attribute}><span><i className="fa fa-circle-thin"></i></span> {this.props.item.attribute}</div>
            <div>{this.contents}</div>
            </>
        );
    }

    onClickReboot = (event: SyntheticEvent) => {
        appEvents.emit('confirm-modal', {
          title: '시스템 재시작',
          text: '플랫폼 서버를 재 시작하시겠습니까? 서버가 원격지에 위치한 경우 신중을 기하시기 바랍니다.',
          text2: '서버를 재 시작 하는 동안 브라우저로 플랫폼에 접속 할 수 없습니다.',
          altActionText: '보류',
          icon: 'fa-superpowers',
          onConfirm: () => {
            getBackendSrv().post(`/api/v1.0/sys/control/restart/1`, {key: "ASCDEFSDCFREDASD"});
          },
          onAltAction: () => {
          },
        });
    };

    get contents(): JSX.Element {
        return (
            <button className="btn btn-danger min-width-16" onClick={e =>this.onClickReboot(e)}>
                <i className="fa fa-superpowers fa-lg"></i><span>시스템 재시작</span>
            </button>
        );
    }
}
