import { EditorState } from "draft-js";
import { stateFromMarkdown } from "draft-js-import-markdown";
import { stateToMarkdown } from "draft-js-export-markdown";
import createAutoListPlugin from "draft-js-autolist-plugin";
import createBlockBreakoutPlugin from "draft-js-block-breakout-plugin";
import createLinkifyPlugin from "draft-js-linkify-plugin";
import createMarklessPlugin from "../src/index.js";
import Editor from "draft-js-plugins-editor";
import PrismDraftDecorator from "draft-js-prism";
import React from "react";

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

const decorator = new PrismDraftDecorator();

export default class HtmlEditor extends React.Component {
  componentDidMount() {
    this.ref.focus();
  }

  constructor(...args) {
    super(...args);
    this.state = {
      editorState: EditorState.createWithContent(
        stateFromMarkdown(this.props.initialValue),
        decorator
      ),
    };
  }


  onEditorStateChange(editorState) {
    this.setState({ editorState });
  }

  render() {
    return(
      <div className="markdown-body">
        <Editor
          ref={(ref) => { this.ref = ref }}
          editorState={this.state.editorState}
          onChange={this.onEditorStateChange.bind(this)}
          plugins={plugins}
        />
      </div>
    );
  }
}
