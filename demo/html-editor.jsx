import { Entity } from "draft-js";
import createAutoListPlugin from "draft-js-autolist-plugin";
import createBlockBreakoutPlugin from "draft-js-block-breakout-plugin";
import createLinkifyPlugin from "draft-js-linkify-plugin";
import createMarklessPlugin from "../src/index.js";
import Editor from "draft-js-plugins-editor";
import Prism from "prismjs";
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

const ImageComponent = (props) => {
  const { alt, src } = Entity.get(props.entityKey).getData();
  return <img alt={alt} src={src} />;
};

const LinkComponent = (props) => {
  const { url } = Entity.get(props.entityKey).getData();
  return(
    <a href={url}>
      {props.children}
    </a>
  );
};

const TokenComponent = (props) => {
  const sections = props.offsetKey.split("-");
  const blockKey = sections[0];
  const offset = sections[1];
  const tokenType = tokensCache[blockKey][offset];
  const block = props.getEditorState().getCurrentContent().getBlockForKey(blockKey);
  return(
    <span className={`prism-token token ${tokenType}`}>
      {props.children}
    </span>
  );
};

const tokensCache = {};

const decorators = [
  {
    strategy: function (contentBlock, callback) {
      contentBlock.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          return entityKey !== null && Entity.get(entityKey).getType() === "LINK";
        },
        callback,
      );
    },
    component: LinkComponent,
  },
  {
    strategy: function (contentBlock, callback) {
      contentBlock.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          return entityKey !== null && Entity.get(entityKey).getType() === "IMAGE";
        },
        callback
      );
    },
    component: ImageComponent,
  },
  {
    strategy: function (contentBlock, callback) {
      if (contentBlock.getType() === "code-block") {
        const languageName = contentBlock.getData().get("languageName");
        const language = Prism.languages[languageName];
        if (language) {
          const tokens = Prism.tokenize(contentBlock.getText(), language);
          const blockKey = contentBlock.getKey();
          tokensCache[blockKey] = tokensCache[blockKey] || {};
          let offset = 0;
          tokens.forEach((token) => {
            if (typeof token === "string") {
              offset += token.length;
            } else {
              tokensCache[blockKey][offset.toString()] = token.type;
              callback(offset, offset + token.content.length);
              offset += token.content.length;
            }
          });
        }
      }
    },
    component: TokenComponent,
  },
];

export default class HtmlEditor extends React.Component {
  render() {
    return(
      <div className="markdown-body">
        <Editor
          decorators={decorators}
          editorState={this.props.editorState}
          onChange={this.props.onHtmlEditorStateChange}
          plugins={plugins}
        />
      </div>
    );
  }
}
