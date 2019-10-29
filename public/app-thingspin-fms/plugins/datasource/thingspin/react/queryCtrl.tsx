// js 3rd party libs
import React from 'react';

// grafana libs
import { coreModule } from "app/core/core";
import { PanelOptionsGroup } from '@grafana/ui';

// thingspin libs
import { RcQueryCtrlProps, ReactDirective } from '../models';
import FacilityTree from 'app-thingspin-fms/react/components/FacilityNodeTree';
import { facilityTreeProps } from 'app-thingspin-fms/react/components/FacilityNodeTree/model';

// load scss
import './_queryCtrl.scss';

export const FcQueryCtrl: React.FC<RcQueryCtrlProps> = ({ inject, target: { tagNodes, siteId }, onChange }) => {

    const click = ({ siteData, Taginfo }: any) => onChange && onChange(siteData.value, Taginfo);

    const props: facilityTreeProps = {
        inject,
        taginfo: tagNodes ? tagNodes : [],
        siteinfo: {
            value: siteId,
        },
        click
    };

    return <div className='fms-form-grid fms-grid1'>
        <PanelOptionsGroup title='태그 선택'>
            <FacilityTree {...props} />
        </PanelOptionsGroup>
    </div>;
};

// conversion react component -> angularJs directive
coreModule.directive('rcTsDs', [
    'reactDirective', (reactDirective: ReactDirective): any => (reactDirective(FcQueryCtrl, [
        'target',
        'inject',
        ['onChange', { watchDepth: 'reference', wrapApply: true }],
    ])),
]);
