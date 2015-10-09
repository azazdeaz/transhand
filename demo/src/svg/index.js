require('./index.html')

import React from 'react'
import ReactDOM from 'react-dom'

import scatterThings from './prepare'
import App from './App'

scatterThings()

ReactDOM.render(<App/>, document.querySelector('#mount-app'))
