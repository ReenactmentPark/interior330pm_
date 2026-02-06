/**
 * Lexical editorState(JSON)에서 이미지 노드의 imageUid들을 추출한다.
 * - 서버 업로드 전(로컬 미리보기) 단계에서도 대표 선택/검증/정리 용도로 사용.
 */
export function extractImageUidsFromLexicalJSON(jsonStr: string): string[] {
  try {
    const parsed = JSON.parse(jsonStr);
    const root = parsed?.root;
    const out: string[] = [];

    const walk = (node: any) => {
      if (!node) return;
      if (node.type === 'image' && typeof node.imageUid === 'string' && node.imageUid.trim()) {
        out.push(node.imageUid);
      }
      const children = node.children;
      if (Array.isArray(children)) {
        for (const c of children) walk(c);
      }
    };

    walk(root);
    return out;
  } catch {
    return [];
  }
}

export function hasImageUid(jsonStr: string, imageUid: string): boolean {
  if (!imageUid) return false;
  return extractImageUidsFromLexicalJSON(jsonStr).includes(imageUid);
}

/**
 * Lexical editorState(JSON) 안에 image 노드는 있는데 imageUid가 비어있는 케이스가 있는지 검사
 * - 드래그&드롭/붙여넣기/구버전 데이터 등에서 발생 가능
 */
export function hasUnresolvedImages(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    const root = parsed?.root;

    let unresolved = false;

    const walk = (node: any) => {
      if (!node || unresolved) return;

      if (node.type === 'image') {
        const uid = node.imageUid;
        if (typeof uid !== 'string' || !uid.trim()) {
          unresolved = true;
          return;
        }
      }

      const children = node.children;
      if (Array.isArray(children)) {
        for (const c of children) walk(c);
      }
    };

    walk(root);
    return unresolved;
  } catch {
    return false;
  }
}

/**
 * 저장/업로드용: 본문이 참조하는 imageUid 리스트를 unique하게 뽑는다.
 */
export function extractUniqueImageUids(jsonStr: string): string[] {
  const uids = extractImageUidsFromLexicalJSON(jsonStr);
  return Array.from(new Set(uids));
}