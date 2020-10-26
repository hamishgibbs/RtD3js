var React = require('react');
var ReactDOM = require('react-dom');

export default class Greetings extends React.Component
{
    render()
    {
        return <h1>Greetings, {this.props.name}</h1>;
    }
}
