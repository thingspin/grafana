import React from 'react';
import { baseClass } from '../types';

export interface AlarmMgmtBaseLayerProps {
  // Top
  title?: string;
  titleIcon?: string;
  buttons?: React.ReactNode[];

  // Contents
  children?: React.ReactNode;
}

const AlarmMgmtBaseLayer: React.FC<AlarmMgmtBaseLayerProps> = ({
  title = "알 수 없음",
  buttons = [],
  titleIcon = "fa fa-info",
  children,
}) => {
  return <div className={baseClass}>
    <div className={`${baseClass}-h`}>
      <div className={`${baseClass}-h-l`}>
        <i className={titleIcon}></i>
        {title}
      </div>

      <div className={`${baseClass}-h-r`}>
        { buttons.map( (button, index) => <div key={index}>{button}</div> ) }
      </div>
    </div>

    <div className={`${baseClass}-b`}>
      {children}
    </div>
  </div>;
};

export default AlarmMgmtBaseLayer;
