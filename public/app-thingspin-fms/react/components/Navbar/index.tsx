import React, { FC } from 'react';
import { TsLeftNavbarComponent } from './LeftNavbar';
import TsRightNavbarComponent from './RightNavbar';
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

interface Props extends TsBaseProps {}

export const TsNavbarComponent: FC<Props> = props => {
  return (
    <>
      <TsLeftNavbarComponent {...props} />
      <TsRightNavbarComponent {...props} />
    </>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connectWithStore(TsNavbarComponent, mapStateToProps, mapDispatchToProps);
