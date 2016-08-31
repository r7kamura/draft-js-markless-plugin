import {
  BLOCK_TYPE,
  ENTITY_TYPE,
  getEntityRanges,
  INLINE_STYLE,
} from "draft-js-utils";
import { Entity } from "draft-js";
import {
  ContentBlock,
  ContentState,
} from "draft-js";

const {
  BOLD,
  CODE,
  ITALIC,
  STRIKETHROUGH,
  UNDERLINE,
} = INLINE_STYLE;

class MarkdownGeneration {
  /**
   * @param {ContentState} contentState
   */
  constructor(contentState) {
    this.contentState = contentState;
    this.blocks = this.contentState.getBlockMap().toArray();
    this.currentBlockIndex = 0;
    this.listItemCounts = {};
    this.output = [];
    this.totalBlocks = this.blocks.length;
  }

  /**
   * @returns {String}
   */
  generate() {
    this.blocks.map((block, index) => {
      this.currentBlockIndex = index;
      this.consumeBlock(block);
    });
    return this.output.join("");
  }

  onBlockHeader(block, level) {
    this.pushLineBreak();
    this.output.push(`${"#".repeat(level)} ${this.renderBlockContent(block)}\n`);
  }

  onBlockListItemUnordered(block) {
    const blockDepth = block.getDepth();
    const blockType = block.getType();
    const lastBlock = this.getLastBlock();
    const lastBlockType = lastBlock ? lastBlock.getType() : null;
    const lastBlockDepth = lastBlock && checkNestableBlockType(lastBlockType) ? lastBlock.getDepth() : null;
    if (lastBlockType !== blockType && lastBlockDepth !== blockDepth - 1) {
      this.pushLineBreak();
      if (lastBlockType === BLOCK_TYPE.ORDERED_LIST_ITEM) {
        this.pushLineBreak();
      }
    }
    const listMarker = "-";
    const indent = " ".repeat(block.depth * 2);
    this.output.push(`${indent}${listMarker} ${this.renderBlockContent(block)}\n`);
  }

  onBlockListItemOrdered(block) {
    const blockDepth = block.getDepth();
    const blockType = block.getType();
    const lastBlock = this.getLastBlock();
    const lastBlockType = lastBlock ? lastBlock.getType() : null;
    const lastBlockDepth = lastBlock && checkNestableBlockType(lastBlockType) ? lastBlock.getDepth() : null;
    if (lastBlockType !== blockType && lastBlockDepth !== blockDepth - 1) {
      this.pushLineBreak();
      if (lastBlockType === BLOCK_TYPE.UNORDERED_LIST_ITEM) {
        this.pushLineBreak();
      }
    }
    const listMarker = `${this.getListItemCount(block) % 1000000000}.`;
    const indent = " ".repeat(block.depth * 2);
    this.output.push(`${indent}${listMarker} ${this.renderBlockContent(block)}\n`);
  }

  onBlockQuote(block) {
    this.pushLineBreak();
    this.output.push(`> ${this.renderBlockContent(block)}\n`);
  }

  onBlockCode(block) {
    this.pushLineBreak();
    this.output.push("```\n");
    this.output.push(`${this.renderBlockContent(block)}\n`);
    this.output.push("```\n");
  }

  onBlockUnknown(block) {
    this.pushLineBreak();
    this.output.push(`${this.renderBlockContent(block)}\n`);
  }

  /**
   * @param {ContentBlock} block
   */
  consumeBlock(block) {
    switch (block.getType()) {
      case "header-one": {
        this.onBlockHeader(block, 1);
        break;
      }
      case "header-two": {
        this.onBlockHeader(block, 2);
        break;
      }
      case "header-three": {
        this.onBlockHeader(block, 3);
        break;
      }
      case "header-four": {
        this.onBlockHeader(block, 4);
        break;
      }
      case "header-five": {
        this.onBlockHeader(block, 5);
        break;
      }
      case "header-six": {
        this.onBlockHeader(block, 6);
        break;
      }
      case "ordered-list-item": {
        this.onBlockListItemOrdered(block);
        break;
      }
      case "unordered-list-item": {
        this.onBlockListItemUnordered(block);
        break;
      }
      case "blockquote": {
        this.onBlockQuote(block);
        break;
      }
      case "code-block": {
        this.onBlockCode(block);
        break;
      }
      default: {
        this.onBlockUnknown(block);
        break;
      }
    }
  }

  /**
   * @returns {ContentBlock}
   */
  getLastBlock() {
    return this.blocks[this.currentBlockIndex - 1];
  }

  /**
   * @returns {ContentBlock}
   */
  getNextBlock() {
    return this.blocks[this.currentBlockIndex + 1];
  }

  /**
   * @param {ContentBlock} block
   * @returns {Number}
   */
  getListItemCount(block) {
    let blockType = block.getType();
    let blockDepth = block.getDepth();
    // To decide if we need to start over we need to backtrack (skipping list
    // items that are of greater depth)
    let index = this.currentBlockIndex - 1;
    let prevBlock = this.blocks[index];
    while (
      prevBlock &&
      checkNestableBlockType(prevBlock.getType()) &&
      prevBlock.getDepth() > blockDepth
    ) {
      index -= 1;
      prevBlock = this.blocks[index];
    }
    if (
      !prevBlock ||
      prevBlock.getType() !== blockType ||
      prevBlock.getDepth() !== blockDepth
    ) {
      this.listItemCounts[blockDepth] = 0;
    }
    return (
      this.listItemCounts[blockDepth] = this.listItemCounts[blockDepth] + 1
    );
  }

  pushLineBreak() {
    if (this.currentBlockIndex > 0) {
      this.output.push("\n");
    }
  }

  /**
   * @param {ContentBlock} block
   * @returns {String}
   */
  renderBlockContent(block) {
    const text = block.getText();
    const zeroWidthSpace = "\u200B";
    if (text === "") {
      return zeroWidthSpace;
    }
    let charMetaList = block.getCharacterList();
    let entityPieces = getEntityRanges(text, charMetaList);
    return entityPieces.map(([entityKey, stylePieces]) => {
      let content = stylePieces.map(([text, style]) => {
        const encodedText = encodeContent(text || "");
        if (encodedText === "") {
          return "";
        } else if (style.has(BOLD)) {
          return `**${encodedText}**`;
        } else if (style.has(UNDERLINE)) {
          return `++${encodedText}++`; // TODO: encode `+`?
        } else if (style.has(ITALIC)) {
          return `_${encodedText}_`;
        } else if (style.has(STRIKETHROUGH)) {
          return `~~${encodedText}~~`; // TODO: encode `~`?
        } else if (style.has(CODE)) {
          if (block.getType() === "code-block") {
            return encodedText;
          } else {
            return "`" + encodedText + "`";
          }
        } else {
          return encodedText;
        }
      }).join("");
      let entity = entityKey ? Entity.get(entityKey) : null;
      if (entity !== null && entity.getType() === ENTITY_TYPE.LINK) {
        let data = entity.getData();
        let url = data.url || '';
        let title = data.title ? ` "${escapeTitle(data.title)}"` : '';
        return `[${content}](${encodeURL(url)}${title})`;
      } else if (entity != null && entity.getType() === ENTITY_TYPE.IMAGE) {
        let data = entity.getData();
        return `![${escapeTitle(data.alt || "")}](${encodeURL(data.src || "")})`;
      } else {
        return content;
      }
    }).join("");
  }
}

/**
 * @param {String} blockType
 * @returns {Boolean}
 */
function checkNestableBlockType(blockType) {
  return ["ordered-list-item", "unordered-list-item"].indexOf(blockType) === 0;
}

/**
 * @param {String} text (e.g. "1 * 1")
 * @returns {String} (e.g. "1 \\* 1")
 */
function encodeContent(text) {
  return text.replace(/[*_`]/g, '\\$&');
}

/**
 * @param {String} url (e.g. "https://example.com/\\")
 * @returns {String} (e.g. "https://example.com/%29")
 */
function encodeURL(url) {
  return url.replace(/\)/g, '%29');
}

/**
 * @param {String} text (e.g. "\"foo\"")
 * @returns {String} (e.g. "\\\"foo\\\"")
 */
function escapeTitle(text) {
  return text.replace(/"/g, '\\"');
}

/**
 * @param {ContentState} contentState
 * @returns {String}
 */
export default function stateToGfm(contentState) {
  return new MarkdownGeneration(contentState).generate();
}
