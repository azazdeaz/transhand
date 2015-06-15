require('./index.html');

import React from 'react';

import scatterThings from './prepare';
import App from './App';

scatterThings();

React.render(<App/>, document.querySelector('#mount-app'));
