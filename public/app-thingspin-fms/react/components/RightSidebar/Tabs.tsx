import React, { ReactNode, useState } from 'react';
import { Provider, TabsComponent } from './Context';

export interface State {
  name: string;
  content: ReactNode;
}

const Tabs: React.FC<{}> = ({ children }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('' as ReactNode);

  const handleTabClick = (n: string, c: ReactNode) => {
    setName(n);
    setContent(c);
  };

  const ProviderValue: TabsComponent = {
    name,
    handleTabClick,
  };

  return <Provider value={ProviderValue}>
    <ul className="fms-tab-header">
      {children}
    </ul>
    <div>
      {content}
    </div>
  </Provider>;
};
export default Tabs;
