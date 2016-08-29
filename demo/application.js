import { EditorState } from "draft-js";
import { stateFromMarkdown } from "draft-js-import-markdown";
import { stateToMarkdown } from "draft-js-export-markdown";
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

class EditorTabContent extends React.Component {
  componentDidMount() {
    this.ref.focus();
  }

  render() {
    return(
      <div className="markdown-body">
        <Editor
          ref={(ref) => { this.ref = ref }}
          editorState={this.props.editorState}
          onChange={this.props.onEditorStateChange}
          plugins={plugins}
        />
      </div>
    );
  }
}

class Root extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      editorState: EditorState.createWithContent(stateFromMarkdown(this.props.initialValue)),
      htmlActive: true,
    };
  }

  onEditorStateChange(editorState) {
    this.setState({ editorState });
  }

  onHtmlTabClicked() {
    this.setState({ htmlActive: true });
  }

  onMarkdownTabClicked() {
    this.setState({ htmlActive: false });
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
            <ul className="tabs">
              <li className="tab" onClick={this.onHtmlTabClicked.bind(this)}>
                <a href="#html">HTML</a>
              </li>
              <li className="tab" onClick={this.onMarkdownTabClicked.bind(this)}>
                <a href="#markdown">Markdown</a>
              </li>
            </ul>
            <div className="card-content" style={{ padding: "0 48px 48px 48px" }}>
              {
                this.state.htmlActive &&
                  <EditorTabContent
                    editorState={this.state.editorState}
                    onEditorStateChange={this.onEditorStateChange.bind(this)}
                  />
              }
              {
                !this.state.htmlActive &&
                  <pre>
                    <code>
                      {stateToMarkdown(this.state.editorState.getCurrentContent())}
                    </code>
                  </pre>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const initialValue = `
# draft-js-markless-plugin

draft-js-markless-plugin is a plugin for draft-js that allows you to create a markdown-like keybinding WYSIWYG editor.

1. Markdown-like keybindings
2. Nice default behaviors for writing text
3. Built on draft.js

## Repository

https://github.com/r7kamura/draft-js-markless-plugin

## LICENSE

draft-js-markless-plugin is MIT licensed.
`;

ReactDOM.render(
  <Root initialValue={initialValue}/>,
  document.getElementById("root")
);
