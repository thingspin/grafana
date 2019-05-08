import React, { MouseEvent } from 'react';

const LEVEL_SPACE = 20;

type ToggleIconParams = {
  on: boolean;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
};

const ToggleIcon = ({ on, onClick }: ToggleIconParams): JSX.Element => (
  <div className="rc-opc-node-toggle-icon" role="button" aria-label="Toggle" onClick={onClick}>
    <i className={on ? "fa fa-caret-down" : "fa fa-caret-up"}></i>
  </div>
);

export interface NodeTreeItem {
  hasNodes?: boolean;
  isOpen?: boolean;
  level?: number;
  active?: boolean;
  key: string;
  label: string | JSX.Element;
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
  onClickOnBtn?: (event: MouseEvent<HTMLDivElement>) => void;
  onAddBtn?: (event: MouseEvent<HTMLButtonElement>) => void;
  [name: string]: any;
}

export type NodeTreeChildren = (
  props: {
    search: Function;
    items: NodeTreeItem[];
  }
) => JSX.Element;

type RenderItem = (props: NodeTreeItem) => JSX.Element;

const renderItem: RenderItem = ({
  hasNodes = false,
  isOpen = false,
  level = 0,
  onClick,
  onClickOnBtn,
  onAddBtn,
  active,
  key,
  label = 'unknown',
}): JSX.Element => (
    <li aria-pressed={active} key={key} onClick={onClick}
      style={{
        padding: ` 12px  0  12px ${level * LEVEL_SPACE}px`,
        color: '#1e1e1e',
        background: active ? '#e3f2fd' : 'none',
      }}
    >
      {(<div className="rc-opc-node-tree"
          style={{
            left: `${level * LEVEL_SPACE}px`,
          }}
        >
          <ToggleIcon on={isOpen} onClick={onClickOnBtn} />

          <div className="rc-opc-node-icon"><i className="fa fa-folder"></i></div>

          {label}

          <button className="rc-opc-node-button" onClick={onAddBtn}><i className="fa fa-plus-circle"></i></button>
        </div>
      )}
    </li>
  );

export const defaultChildren: NodeTreeChildren = ({ search, items }): JSX.Element => {
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    search(value);
  };

  return (
    <>
      <input type="search" placeholder="Type and search" aria-label="Type and search"
        className="rc-opc-tree-search" onChange={onSearch} />

      <ul style={{ listStyleType: 'none', paddingLeft: 0, overflow: "auto", }}>
        {items.map(renderItem)}
      </ul>
    </>
  );
};
