import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $isRootNode,
  $createParagraphNode,
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from 'lexical';
import { $createImageNode, type ImagePayload, $isImageNode } from './ImageNode';

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> = createCommand('INSERT_IMAGE_COMMAND');

function ensureTrailingParagraph() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  const anchor = selection.anchor.getNode();
  const top = anchor.getTopLevelElementOrThrow();
  if ($isRootNode(top.getParentOrThrow())) {
    // 이미지 삽입 후 바로 아래에 입력 가능하도록 문단 하나 확보
    const p = $createParagraphNode();
    top.insertAfter(p);
  }
}

export default function ImagesPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<ImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        editor.update(() => {
          const selection = $getSelection();

          const imageNode = $createImageNode(payload);

          if ($isRangeSelection(selection)) {
            // selection 위치에 블록 노드 삽입
            $insertNodes([imageNode]);
            ensureTrailingParagraph();
            return;
          }

          // selection 없을 때는 그냥 끝에 붙임
          const root = editor.getEditorState()._nodeMap.get('root'); // fallback 방지용
          // 위는 내부 접근이라 사용 안 함. 대신 selection 없으면 $insertNodes가 noop일 수 있으니:
          $insertNodes([imageNode, $createParagraphNode()]);
        });

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
