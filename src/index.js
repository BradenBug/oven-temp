import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import Container from "react-bootstrap/Container";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Row from "react-bootstrap/Row";

import Paho from "paho-mqtt";

import "./index.css";

class Temp extends React.Component {
  constructor(props) {
    super(props);

    this.client = new Paho.Client("ws://mqtt.eclipse.org/mqtt:80", "ovenClient");
    this.client.onMessageArrived = (message) => {
      console.log(message.payloadString);
      var json = JSON.parse(message.payloadString);
      console.log(message.json);
      this.setState((state, props) => {
        return {currentTempF: json.f, currentTempC: json.c};
      });
      this.setState((state, props) => {
        return this.state.unit === "F" ? {current: json.f} : 
          {current: json.c};
      });
    };
    this.client.connect({onSuccess:() => {
      this.client.subscribe("ovenTest");
    }});

    this.state = {
      unit: "F",
      currentTempF: "0",
      currentTempC: "0",
      current: "0",
    };
  }

  handleChange = (val) => {
    this.setState((state, props) => {
      return val === "F" ? {unit: val, current: this.state.currentTempF} :
        {unit: val, current: this.state.currentTempC};
    });
  } 

  render() {
    return (
      <Container>
        <Row className="justify-content-md-center">
          <h1 className="display-4 text-center text-dark">{this.state.current}° {this.state.unit}</h1>
        </Row>
        <Row className="justify-content-md-center">
          <ToggleButtonGroup type="radio" name="unit" onChange={this.handleChange} defaultValue={"F"}>
            <ToggleButton name="unit" value={"F"}>Fahrenheit</ToggleButton>
            <ToggleButton name="unit" value={"C"}>Celsius</ToggleButton>
          </ToggleButtonGroup>
        </Row>
      </Container>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <Container>
          <h1 className="display-3 text-center text-dark font-weight-bold">Braden's Oven Temperature</h1>
        </Container>
        <Temp />
      </div>
    );
  }
}

ReactDOM.render(
    <App />,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
