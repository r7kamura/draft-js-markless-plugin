import { EditorState } from "draft-js";

/**
 * @param {EditorState} editorState
 * @param {String} type
 * @returns {EditorState}
 */
const changeCurrentBlockType = (editorState, type) => {
  const currentContent = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const blockMap = currentContent.getBlockMap();
  const block = blockMap.get(key);
  const newBlock = block.merge({
    type,
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
    }
  };
}
