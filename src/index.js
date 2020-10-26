var React = require('react');
var ReactDOM = require('react-dom');

import Greetings from './greeting';

export default class App extends React.Component{
    render()
    {
        return React.createElement('div', null, React.createElement(Greetings));
    }
}
