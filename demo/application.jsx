import { ContentState, EditorState } from "draft-js";
import { stateFromMarkdown } from "@r7kamura/draft-js-import-markdown";
import stateToMarkdown from "./state-to-gfm";
import HtmlEditor from "./html-editor.jsx";
import MarkdownEditor from "./markdown-editor.jsx";
import React from "react";
import ReactDOM from "react-dom";

class Root extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      htmlEditorState: EditorState.createWithContent(
        stateFromMarkdown(this.props.initialValue)
      ),
      htmlActive: true,
    };
  }

  onHtmlEditorStateChange(editorState) {
    this.setState({ htmlEditorState: editorState });
  }

  onMarkdownEditorStateChange(editorState) {
    this.setState({ markdownEditorState: editorState });
  }

  onHtmlTabClicked() {
    if (!this.state.htmlActive) {
      this.setState({
        htmlActive: true,
        htmlEditorState: EditorState.createWithContent(
          stateFromMarkdown(
            this.state.markdownEditorState.getCurrentContent().getPlainText()
          )
        ),
      });
    }
  }

  onMarkdownTabClicked() {
    if (this.state.htmlActive) {
      this.setState({
        htmlActive: false,
        markdownEditorState: EditorState.createWithContent(
          ContentState.createFromText(
            stateToMarkdown(
              this.state.htmlEditorState.getCurrentContent()
            )
          )
        ),
      });
    }
  }

  render() {
    return(
      <div>
        <header className="header">
          <div className="container">
            <h1 style={{ margin: 0, lineHeight: 1 }}>
              <a href="https://github.com/r7kamura/draft-js-markless-plugin" style={{ fontSize: "20px", color: "white" }}>r7kamura/draft-js-markless-plugin</a>
            </h1>
            <p className="header-description">
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
                  <HtmlEditor
                    editorState={this.state.htmlEditorState}
                    onEditorStateChange={this.onHtmlEditorStateChange.bind(this)}
                  />
              }
              {
                !this.state.htmlActive &&
                  <MarkdownEditor
                    editorState={this.state.markdownEditorState}
                    onEditorStateChange={this.onMarkdownEditorStateChange.bind(this)}
                  />
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

![demo](https://raw.githubusercontent.com/r7kamura/draft-js-markless-plugin/master/images/demo.gif)

## Repository

https://github.com/r7kamura/draft-js-markless-plugin

## LICENSE

draft-js-markless-plugin is MIT licensed.
`;

ReactDOM.render(
  <Root initialValue={initialValue}/>,
  document.getElementById("root")
);
