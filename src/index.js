import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Row from "react-bootstrap/Row";

import "./index.css";

var unit = "F";

class UnitSelect extends React.Component {
  handleChange(val) {
    unit = val;
    console.log(val);
  }

  render() {
    return (
      <ToggleButtonGroup type="radio" name="unit" onChange={this.handleChange} defaultValue={"F"}>
        <ToggleButton name="unit" value={"F"}>Fahrenheit</ToggleButton>
        <ToggleButton name="unit" value={"C"}>Celsius</ToggleButton>
      </ToggleButtonGroup>
    );
  }
}

class Temp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fahrenheit: 32,
      celsius: 0,
    };
  }

  render() {
    var currentTemp;

    if (unit === "F") {
      currentTemp = this.state.fahrenheit
    } else {
      currentTemp = this.state.celsius
    }

    return (
      <h1 className="display-4 text-center text-dark">{currentTemp}° {unit}</h1>
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
        <Container>
            <Row className="justify-content-md-center">
              <Temp />
            </Row>
            <Row className="justify-content-md-center">
              <UnitSelect />
            </Row>
        </Container>
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
