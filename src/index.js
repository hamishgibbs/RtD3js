var React = require('react');
var ReactDOM = require('react-dom');

import Greetings from './test';

class App extends React.Component{
    render()
    {
        return React.createElement('div', null, React.createElement(Greetings));
    }
}

window.onload = function()
{
  ReactDOM.render(
      React.createElement(App),
      document.getElementById('root')
  );
};
