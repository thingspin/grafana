import React from 'react';
import { contClass } from '../types';

export interface ContainerProps {
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;

  children?: React.ReactNode;
}

const TsContainer: React.FC<ContainerProps> = ({ headerLeft, headerRight, children }) => {
  return <div className={contClass}>
    {(headerLeft || headerRight) && (
      <div className={`${contClass}-h`}>
        {headerLeft && (
          <div className={`${contClass}-h-l`}>{headerLeft}</div>
        )}

        {headerRight && (
          <div className={`${contClass}-h-r`}>{headerRight}</div>
        )}
      </div>
    )}

    <div className={`${contClass}-b`}>
      {children}
    </div>
  </div>;
};

export default TsContainer;
