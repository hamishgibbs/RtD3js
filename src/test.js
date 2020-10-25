var React = require('react');
var ReactDOM = require('react-dom');

export default class Greetings extends React.Component
{
    render()
    {
        return React.createElement('h1', null, 'Greetings, Hamish!');
    }
}
