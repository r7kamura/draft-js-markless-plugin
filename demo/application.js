import { EditorState } from "draft-js";
import createAutoListPlugin from "draft-js-autolist-plugin";
import createBlockBreakoutPlugin from "draft-js-block-breakout-plugin";
import createLinkifyPlugin from "draft-js-linkify-plugin";
import createMarklessPlugin from "../src/index.js";
import Editor from "draft-js-plugins-editor";
import React from "react";
import ReactDOM from "react-dom";

const autoListPlugin = createAutoListPlugin();
const blockBreakoutPlugin = createBlockBreakoutPlugin({
  breakoutBlocks: [
    "blockquote",
    "header-five",
    "header-four",
    "header-one",
    "header-six",
    "header-three",
    "header-two",
  ]
});
const linkifyPlugin = createLinkifyPlugin();
const marklessPlugin = createMarklessPlugin();
const plugins = [
  autoListPlugin,
  blockBreakoutPlugin,
  linkifyPlugin,
  marklessPlugin,
];

class Root extends React.Component {
  componentDidMount() {
    this.ref.focus();
  }

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
        <header
          style={{
            backgroundColor: "#333",
            padding: "10px 20px 100px",
          }}
        >
          <div className="container">
            <h1 style={{ margin: 0, lineHeight: 1 }}>
              <a href="https://github.com/r7kamura/draft-js-markless-plugin" style={{ fontSize: "20px", color: "white" }}>r7kamura/draft-js-markless-plugin</a>
            </h1>
            <p style={{ color: "#CCC" }}>
              A plugin for draft-js that allows you to create a markdown-like keybinding WYSIWYG editor.
            </p>
          </div>
        </header>
        <div className="container" style={{ marginTop: "-80px" }}>
          <div className="card">
            <div className="card-content">
              <div className="markdown-body">
                <Editor
                  ref={(ref) => { this.ref = ref }}
                  editorState={this.state.editorState}
                  onChange={this.onChange.bind(this)}
                  plugins={plugins}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Root/>,
  document.getElementById("root")
);
