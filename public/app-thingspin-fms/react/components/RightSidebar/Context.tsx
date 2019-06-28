import { createContext, ReactNode } from 'react';

// React Context
const TabsContext = createContext<TabsComponent>({});
const { Provider, Consumer } = TabsContext;

export interface TabsComponent {
    name?: string;
    handleTabClick?: (name: string, content: ReactNode) => void;
}

export {
    Provider,
    Consumer,
};

export default TabsContext;
