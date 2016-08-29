import { EditorState } from "draft-js";
import createMarklessPlugin from "../src/index.js";
import Editor from "draft-js-plugins-editor";
import React from "react";
import ReactDOM from "react-dom";

const marklessPlugin = createMarklessPlugin();
const plugins = [
  marklessPlugin,
];

class Root extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { editorState: EditorState.createEmpty() };
  }

  onChange(editorState) {
    this.setState({ editorState });
  }

  render() {
    return(
      <div>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange.bind(this)}
          plugins={plugins}
        />
      </div>
    );
  }
}

ReactDOM.render(
  <Root/>,
  document.getElementById("root")
);
