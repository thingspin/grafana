import React from 'react';

import { storiesOf } from '@storybook/react';
import TableInputCSV from './TableInputCSV';
import { action } from '@storybook/addon-actions';
import { TableData } from '../../types/data';
import { withCenteredStory } from '../../utils/storybook/withCenteredStory';

const TableInputStories = storiesOf('UI/Table/Input', module);

TableInputStories.addDecorator(withCenteredStory);

TableInputStories.add('default', () => {
  return (
    <div style={{ width: '90%', height: '90vh' }}>
      <TableInputCSV
        text={'a,b,c\n1,2,3'}
        onTableParsed={(table: TableData, text: string) => {
          console.log('Table', table, text);
          action('Table')(table, text);
        }}
      />
    </div>
  );
});
