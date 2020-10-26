var React = require('react');
var ReactDOM = require('react-dom');

import Greetings from './greeting';
import SummaryWidget from './summaryWidget';

export default class App extends React.Component{
    render()
    {
        if (this.props.widget == 'summaryWidget'){
          return React.createElement('div', null, <SummaryWidget></SummaryWidget>);
        } else {
          return <h1>Unknown widget</h1>
        }
    }
}
