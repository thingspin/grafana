import React, { FC } from 'react';
import { TsLeftNavbarComponent } from './LeftNavbar';
import TsRightNavbarComponent from './RightNavbar';
import { TsBaseProps } from 'app-thingspin-fms/models/common';

interface Props extends TsBaseProps {}

export const TsNavbarComponent: FC<Props> = props => {
  return (
    <div>
      <TsLeftNavbarComponent key="leftnavbar" />
      <TsRightNavbarComponent key="rightnavbar" {...props} />
    </div>
  );
};
