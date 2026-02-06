import type { ReactNode } from 'react';
import React, { useMemo, useRef, useState } from 'react';

import {
  $applyNodeReplacement,
  $getNodeByKey,
  DecoratorNode,
  type LexicalNode,
} from 'lexical';

import type { DOMExportOutput, EditorConfig, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';

import styles from './ImageNode.module.css';
import { useThumbnail } from '../thumbnailContext';

export type ImagePayload = {
  imageUid: string;
  src: string;
  altText?: string;
  width?: number;
  height?: number;
};

type SerializedImageNode = Spread<
  {
    type: 'image';
    version: 1;
    imageUid: string;
    src: string;
    altText: string;
    width: number;
    height: number;
  },
  SerializedLexicalNode
>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export class ImageNode extends DecoratorNode<ReactNode> {
  __src: string;
  __altText: string;
  __width: number;
  __height: number;
  __imageUid: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__imageUid,node.__src, node.__altText, node.__width, node.__height, node.__key);
  }

  constructor(imageUid: string,src: string, altText: string, width: number, height: number, key?: NodeKey) {
    super(key);
    this.__imageUid = imageUid;
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { imageUid, src, altText, width, height } = serializedNode;
    return $createImageNode({ imageUid, src, altText, width, height });
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      imageUid: this.__imageUid,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
    };
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement('img');
    img.setAttribute('data-image-uid', this.__imageUid);
    img.setAttribute('src', this.__src);
    img.setAttribute('alt', this.__altText);
    if (this.__width) img.setAttribute('width', String(this.__width));
    if (this.__height) img.setAttribute('height', String(this.__height));
    return { element: img };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  setDimensions(width: number, height: number) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  decorate(_editor: LexicalEditor): ReactNode {
    return (
      <ImageComponent
        nodeKey={this.getKey()}
        imageUid={this.__imageUid}
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
      />
    );
  }
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  const src = payload.src;
  const altText = payload.altText ?? '';
  const width = payload.width ?? 0;
  const height = payload.height ?? 0;
  return $applyNodeReplacement(new ImageNode(payload.imageUid, src, altText, width, height));
}

export function $isImageNode(node: unknown): node is ImageNode {
  return node instanceof ImageNode;
}

function ImageComponent({
  nodeKey,
  imageUid,
  src,
  altText,
  width,
  height,
}: {
  nodeKey: NodeKey;
  imageUid: string;
  src: string;
  altText: string;
  width: number;
  height: number;
}) {
  const [editor] = useLexicalComposerContext();
  const { thumbnailImageUid, setThumbnailImageUid } = useThumbnail();
  const isThumb = thumbnailImageUid === imageUid;
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);

  const sizeStyle = useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = {};
    if (width > 0) s.width = `${width}px`;
    if (height > 0) s.height = `${height}px`;
    return s;
  }, [width, height]);

  const onPointerDown: React.MouseEventHandler = (e) => {
    if (isResizing) return;
    e.preventDefault();
    e.stopPropagation();

    if (!e.shiftKey) {
      clearSelection();
      setSelected(true);
    } else {
      setSelected(!isSelected);
    }
  };

  const startResize = (startX: number, startY: number) => {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const startW = rect.width;
    const startH = rect.height;

    setIsResizing(true);

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault();
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const nextW = clamp(Math.round(startW + dx), 80, 1600);
      const nextH = clamp(Math.round(startH + dy), 80, 1600);

      editor.update(() => {
        const node = $getNodeByKey(nodeKey) as LexicalNode | null;
        if ($isImageNode(node)) {
          node.setDimensions(nextW, nextH);
        }
      });
    };

    const onUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp, { passive: true });
  };

  const onHandlePointerDown: React.PointerEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSelected) {
      clearSelection();
      setSelected(true);
    }

    startResize(e.clientX, e.clientY);
  };

  const className = `${styles.img} ${isSelected ? styles.selected : ''}`;

  return (
    <span className={styles.wrapper}>
      <figure className={styles.figure}>
        <img
          ref={imgRef}
          src={src}
          alt={altText}
          className={className}
          style={sizeStyle}
          draggable={false}
          onClick={onPointerDown}
          data-image-uid={imageUid}
        />
        {isSelected && (
          <div className={styles.thumbBar}>
            {isThumb && <span className={styles.thumbBadge}>대표</span>}

            <button
              type="button"
              className={styles.thumbBtn}
              onPointerDown={(e) => {
                // ✅ selection/drag 깨지지 않게
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // ✅ 대표 지정 (대표는 반드시 1개 유지하고 싶으면 토글 막아도 됨)
                setThumbnailImageUid(imageUid);
              }}
              aria-label="대표 이미지로 지정"
              title="대표 이미지로 지정"
              disabled={isThumb}
            >
              {isThumb ? '대표 이미지' : '대표로 지정'}
            </button>
          </div>
        )}
        {isSelected && (
          <span
            className={`${styles.resizeHandle} ${styles.br}`}
            onPointerDown={onHandlePointerDown}
            role="button"
            aria-label="Resize image"
            tabIndex={0}
          />
        )}
      </figure>
    </span>
  );
}
