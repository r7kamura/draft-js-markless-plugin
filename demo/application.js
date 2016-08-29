import CreateMarklessPlugin from "../src/index.js";
import React from "react";
import ReactDOM from "react-dom";

class Root extends React.Component {
  render() {
    return(
      <div>
        root
      </div>
    );
  }
}

ReactDOM.render(
  <Root/>,
  document.getElementById("root")
);
