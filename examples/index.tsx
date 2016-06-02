import * as React from 'react';
import * as ReactDOM from 'react-dom';

import STATIC_CHART from './StaticChart';
import BASIC_INTERACTIVE_CHART from './BasicInteractiveChart';

import '../styles/index.less';
import './example-styles.less';

const APP_ELEMENT = document.getElementById('app');

const TEST_COMPONENT = (
  <div className='container'>
    <div className='explanation'>This is a basic, static chart. It is not interactive.</div>
    {STATIC_CHART}
    <div className='explanation'>This is a more complex chart. Drag to pan and scroll to zoom.</div>
    {BASIC_INTERACTIVE_CHART}
  </div>
);

ReactDOM.render(TEST_COMPONENT, APP_ELEMENT);
