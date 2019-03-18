import React, { FC } from 'react';
import TsIconLogo from './IconLogo';
import TsNavTitle from './NavTitle';
import { TsBaseProps } from 'app-thingspin-fms/models/common';

interface Props extends TsBaseProps {}

export const TsLeftNavbarComponent: FC<Props> = props => {
  return (
    <div className="ts-left-navbar">
      <TsIconLogo {...props} />
      <TsNavTitle {...props} />
    </div>
  );
};
