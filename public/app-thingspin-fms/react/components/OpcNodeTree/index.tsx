import { Component } from 'react';
import { debounce } from 'lodash';

import walk, { TreeNode, OpcNodeItem, TreeNodeInArray, LocaleFunction } from './walk';
import { defaultChildren, NodeTreeChildren, NodeTreeItem } from './renderProps';
import { getBackendSrv, BackendSrv } from 'app/core/services/backend_srv';

export type NodeTreeProps = {
  data: { [name: string]: TreeNode } | TreeNodeInArray[];
  activeKey?: string;
  initialActiveKey?: string;
  initialOpenNodes?: string[];
  openNodes?: string[];
  onClickItem: (props: OpcNodeItem) => void;
  onClickAdd: (props: OpcNodeItem) => void;
  debounceTime: number;
  children: NodeTreeChildren;
  locale?: LocaleFunction;

  flowId?: string;
};

export type NodeTreeState = {
  openNodes: string[];
  searchTerm: string;
  activeKey: string;
  nodes: { [name: string]: TreeNode } | TreeNodeInArray[];
};

// const defaultOnClick = (props: OpcNodeItem) => console.log(props); // eslint-disable-line no-console
const defaultOnClick = (props: OpcNodeItem): void => { };

export default class OpcNodeTree extends Component<NodeTreeProps, NodeTreeState> {
  backendSrv: BackendSrv = getBackendSrv();
  private readonly nodeRedHost: string = `/api/cep` as string;

  static defaultProps: NodeTreeProps = {
    data: {},
    onClickItem: defaultOnClick,
    onClickAdd: defaultOnClick,
    debounceTime: 125,
    children: defaultChildren,
  };

  state: NodeTreeState = {
    openNodes: this.props.initialOpenNodes || [],
    searchTerm: '',
    activeKey: this.props.initialActiveKey || '',
    nodes: this.props.data,
  };

  componentWillMount() {
    this.updateData();
  }

  setChildNodes(browserResults: any[]): any[] {
    const nodes = [];
    for (const browser of browserResults) {
      nodes.push({
        key: browser.nodeId,
        label: browser.displayName.text,
        nodes: [],
        item: {
          ...browser,
          name: browser.displayName.text,
        },
      });
    }
    return nodes;
  }

  async updateData() {
    try {
      if (this.props.flowId !== undefined) {
        const result = await this.backendSrv.get(`${this.nodeRedHost}/opcua/${this.props.flowId}/browser`);

        const nodes = this.setChildNodes(result.browserResults);
        this.setState({ nodes });
      }
    } catch (e) {
      console.error(e);
    }
  }

  onSearch = (value: string): void => {
    const { debounceTime } = this.props;
    const search = debounce( (searchTerm: string) => this.setState({ searchTerm }), debounceTime, );

    search(value);
  }

  toggleNode(node: string): void {
    if (!this.props.openNodes) {
      const { openNodes } = this.state;
      const newOpenNodes = openNodes.includes(node)
        ? openNodes.filter(openNode => openNode !== node)
        : [...openNodes, node];

      this.setState({ openNodes: newOpenNodes });
    }
  }

  findNode(nodes: any, nodeId: string) {
    if (!nodes || nodes.length === 0) {
      return null;
    }

    for (const node of nodes) {
      if (node.item.nodeId === nodeId) {
        return node;
      }

      // recursive function
      const result: any = this.findNode(node.nodes, nodeId);
      if (result) {
        return result;
      }
    }

    return null;
  }

  async updateChildNode(nodeId: string) {
    try {
      const result: any = await this.backendSrv.get(`${this.nodeRedHost}/opcua/${this.props.flowId}/browser`, {
        nodeid: nodeId,
      });

      const node: any = this.findNode(this.state.nodes, nodeId);
      node.nodes = this.setChildNodes(result.browserResults);

      this.setState({ nodes: this.state.nodes });
    } catch (e) {
      console.error(e);
    }
  }

  generateItems(): NodeTreeItem[] {
    const { onClickItem, onClickAdd, locale } = this.props;
    const { searchTerm, nodes: data } = this.state;
    const openNodes: string[] = this.props.openNodes || this.state.openNodes;
    const activeKey: string = this.props.activeKey || this.state.activeKey;

    const items: OpcNodeItem[] = walk({ data, openNodes, searchTerm, locale });

    return items.map( (props): OpcNodeItem => {
      const { key, item: {nodeId,}, } = props;

      // events
      const onClickOnBtn = () => {
        if (!openNodes.includes(key)) {
          this.updateChildNode(nodeId);
        }
        this.toggleNode(props.key);
      };

      const onClick = (): void => {
        this.setState({ activeKey: key });
        onClickItem(props);
      };
      const onAddBtn = (): void => {
        onClickAdd(props);
      };

      return {
        ...props,
        active: (key === activeKey),
        onClick,
        onClickOnBtn,
        onAddBtn,
      };
    });
  }

  render(): JSX.Element {
    const { data, children } = this.props;

    const search: Function = this.onSearch;
    const items = data ? this.generateItems() : [];
    const renderedChildren = children || defaultChildren;

    return renderedChildren({ search, items });
  }
}
