import React, { FC } from 'react';
import { TsLeftNavbarComponent } from './LeftNavbar';
import TsRightNavbarComponent from './RightNavbar';
import { TsBaseProps } from 'app-thingspin-fms/models/common';

interface Props extends TsBaseProps {}

export const TsNavbarComponent: FC<Props> = props => {
  return (
    <>
      <TsLeftNavbarComponent key="leftnavbar" {...props} />
      <TsRightNavbarComponent key="rightnavbar" {...props} />
    </>
  );
};
