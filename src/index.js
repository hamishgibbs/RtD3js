var React = require('react');
var ReactDOM = require('react-dom');

import Greetings from './greeting';
import SummaryWidget from './summaryWidget';

export default class App extends React.Component{
    render()
    {
        if (this.props.widget == 'summaryWidget'){
          return (
            <div>
              <SummaryWidget x={this.props.x}></SummaryWidget>
            </div>
          );
        } else {
          return <h1>Unknown widget</h1>
        }
    }
}
