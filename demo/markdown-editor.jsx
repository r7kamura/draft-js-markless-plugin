import { Editor } from "draft-js";
import React from "react";

export default class MarkdownEditor extends React.Component {
  render() {
    return(
      <Editor
        editorState={this.props.editorState}
        onChange={this.props.onEditorStateChange}
      />
    );
  }
}
