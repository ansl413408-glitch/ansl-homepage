# -*- coding: utf-8 -*-
# ============================================================
#  갤러리 빌더  (이 파일은 수정할 필요 없습니다)
#
#  사용법:  이 폴더에서 아래 명령을 실행하세요.
#      python build_gallery.py
#
#  하는 일:  gallery_data.py 의 ENTRIES 를 읽어 gallery.html 의
#            자동 생성 구간(<!-- GALLERY:AUTO-START --> ~ <!-- GALLERY:AUTO-END -->)
#            을 다시 만들어 넣습니다.  사진은 images/gallery/ 에서 이름으로 찾습니다.
# ============================================================

import os, re, sys, html

# 콘솔에 한글/이모지 출력 시 인코딩 오류 방지
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
GALLERY_HTML = os.path.join(HERE, "gallery.html")
PHOTO_DIR = os.path.join(HERE, "images", "gallery")
PHOTO_WEB = "images/gallery"          # 웹에서 쓰는 경로(슬래시)
START = "<!-- GALLERY:AUTO-START"      # 시작 마커(주석 시작 부분)
END = "<!-- GALLERY:AUTO-END -->"      # 끝 마커

# 사진 파일 자동 탐색 시 시도할 확장자
EXTS = (".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG", ".webp", ".gif")


def load_entries():
    try:
        from gallery_data import ENTRIES
        return ENTRIES
    except Exception as e:
        print("❌ gallery_data.py 를 읽지 못했습니다:", e)
        sys.exit(1)


def fmt(text):
    """여러 줄 텍스트를 HTML로.
       규칙: 빈 줄 = 문단 나누기(<br><br>).  일반 줄바꿈은 한 문단으로 자연스럽게 이어짐.
       (편집기에서 길게 여러 줄로 써도, 빈 줄이 없으면 한 문단으로 붙습니다.)"""
    if not text:
        return ""
    raw = str(text).replace("\r\n", "\n").strip()
    paras = re.split(r"\n\s*\n", raw)                    # 빈 줄로 문단 분리
    out = []
    for p in paras:
        joined = " ".join(ln.strip() for ln in p.split("\n") if ln.strip())
        if joined:
            out.append(html.escape(joined))              # &, <, > 안전 처리
    return "<br><br>".join(out)


def find_photo(name):
    """images/gallery/ 에서 사진 파일을 찾는다. 정확한 이름 → 없으면 확장자 자동 탐색."""
    name = (name or "").strip()
    if not name:
        return None
    if os.path.exists(os.path.join(PHOTO_DIR, name)):
        return name
    base = os.path.splitext(name)[0]
    for ext in EXTS:
        cand = base + ext
        if os.path.exists(os.path.join(PHOTO_DIR, cand)):
            return cand
    return None


def render(entry):
    photo = (entry.get("photo") or "").strip()
    title = (entry.get("title") or "").strip()
    desc = entry.get("desc") or ""
    mem = entry.get("mem") or ""
    if isinstance(mem, (list, tuple)):
        mem = ", ".join(str(m) for m in mem)

    found = find_photo(photo)
    src = f"{PHOTO_WEB}/{found}" if found else f"{PHOTO_WEB}/{photo}"
    alt = html.escape(title or "ANSL gallery")

    out = []
    out.append('      <div class="gitem" data-ani="up">')
    out.append(f'        <figure class="g-photo"><img src="{src}" alt="{alt}" loading="lazy"></figure>')
    out.append('        <div class="cap">')
    if title:
        out.append(f'          <div class="t">{html.escape(title)}</div>')
    if str(desc).strip():
        out.append(f'          <div class="d">{fmt(desc)}</div>')
    if str(mem).strip():
        out.append(f'          <div class="mem">{fmt(mem)}</div>')
    out.append("        </div>")
    out.append("      </div>")
    return "\n".join(out), found


def main():
    entries = load_entries()
    blocks, missing = [], []
    for i, e in enumerate(entries, 1):
        block, found = render(e)
        blocks.append(block)
        if not found:
            missing.append((i, e.get("title", ""), e.get("photo", "")))

    items = "\n\n".join(blocks)

    with open(GALLERY_HTML, encoding="utf-8") as f:
        doc = f.read()

    s = doc.find(START)
    e = doc.find(END)
    if s == -1 or e == -1:
        print("❌ gallery.html 에서 마커를 찾지 못했습니다.")
        print("   <!-- GALLERY:AUTO-START --> 와 <!-- GALLERY:AUTO-END --> 가 있는지 확인하세요.")
        sys.exit(1)

    s_end = doc.find("-->", s) + 3            # 시작 마커 주석의 끝
    new_doc = doc[:s_end] + "\n" + items + "\n\n      " + doc[e:]

    with open(GALLERY_HTML, "w", encoding="utf-8") as f:
        f.write(new_doc)

    print(f"✅ gallery.html 갱신 완료 — 항목 {len(entries)}개")
    if missing:
        print("\n⚠️  아래 사진이 images/gallery/ 에 아직 없습니다. 그 이름으로 저장해 주세요:")
        for i, t, p in missing:
            print(f"   #{i}  '{t}'  →  images/gallery/{p}")
    else:
        print("   모든 사진 파일 확인됨.")
    print("\n다음: GitHub Desktop 에서 Commit → Push 하면 사이트에 반영됩니다.")


if __name__ == "__main__":
    main()
