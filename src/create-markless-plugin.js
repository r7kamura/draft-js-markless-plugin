import { genKey, ContentBlock, EditorState, RichUtils } from "draft-js";
import { List } from "immutable";

/**
 * @param {EditorState} editorState
 * @param {String} type
 * @returns {EditorState}
 */
const changeCurrentBlockType = (editorState, type, blockMetadata = {}) => {
  const currentContent = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const blockMap = currentContent.getBlockMap();
  const block = blockMap.get(key);
  const newBlock = block.merge({
    type,
    data: block.getData().merge(blockMetadata),
    text: "",
  });
  const newSelection = selection.merge({
    anchorOffset: 0,
    focusOffset: 0,
  });
  const newContentState = currentContent.merge({
    blockMap: blockMap.set(key, newBlock),
    selectionAfter: newSelection,
  });
  return EditorState.push(
    editorState,
    newContentState,
    "change-block-type"
  );
};

export default function createMarklessPlugin () {
  return {
    handleBeforeInput(character, { getEditorState, setEditorState }) {
      const editorState = getEditorState();
      const key = editorState.getSelection().getStartKey();
      const text = editorState.getCurrentContent().getBlockForKey(key).getText();
      switch (`${text}${character}`) {
      case "# ":
        setEditorState(changeCurrentBlockType(editorState, "header-one"));
        return true;
      case "## ":
        setEditorState(changeCurrentBlockType(editorState, "header-two"));
        return true;
      case "### ":
        setEditorState(changeCurrentBlockType(editorState, "header-three"));
        return true;
      case "#### ":
        setEditorState(changeCurrentBlockType(editorState, "header-four"));
        return true;
      case "##### ":
        setEditorState(changeCurrentBlockType(editorState, "header-five"));
        return true;
      case "###### ":
        setEditorState(changeCurrentBlockType(editorState, "header-six"));
        return true;
      case "> ":
        setEditorState(changeCurrentBlockType(editorState, "blockquote"));
        return true;
      default:
        return false;
      }
    },

    handleReturn(event, { getEditorState, setEditorState }) {
      const editorState = getEditorState();
      const contentState = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const key = selection.getStartKey();
      const currentBlock = contentState.getBlockForKey(key);
      const targetString = "```";
      const matchData = /^```([\w-]+)?$/.exec(currentBlock.getText());
      if (matchData && selection.getEndOffset() === currentBlock.getText().length) {
        setEditorState(changeCurrentBlockType(editorState, "code-block", { languageName: matchData[1] }));
        return true;
      }
      if (RichUtils.getCurrentBlockType(editorState) === "code-block") {
        if (event.ctrlKey) {
          const emptyBlockKey = genKey();
          const emptyBlock = new ContentBlock({
            characterList: List(),
            depth: 0,
            key: emptyBlockKey,
            text: "",
            type: "unstyled",
          })
          const blockMap = contentState.getBlockMap();
          const blocksBefore = blockMap.toSeq().takeUntil((value) => value === currentBlock);
          const blocksAfter = blockMap.toSeq().skipUntil((value) => value === currentBlock).rest();
          const augmentedBlocks = [
            [
              currentBlock.getKey(),
              currentBlock,
            ],
            [
              emptyBlockKey,
              emptyBlock,
            ],
          ];
          const newBlocks = blocksBefore.concat(augmentedBlocks, blocksAfter).toOrderedMap();
          const focusKey = emptyBlockKey;
          const newContentState = contentState.merge({
            blockMap: newBlocks,
            selectionBefore: selection,
            selectionAfter: selection.merge({
              anchorKey: focusKey,
              anchorOffset: 0,
              focusKey: focusKey,
              focusOffset: 0,
              isBackward: false,
            }),
          });
          setEditorState(
            EditorState.push(
              editorState,
              newContentState,
              "split-block"
            )
          );
          return true;
        } else {
          setEditorState(RichUtils.insertSoftNewline(editorState));
          return true;
        }
      }
    }
  };
}
