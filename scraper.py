#!/usr/bin/env python3
"""
Scraper de sitios web — extrae HTML, CSS, JS e imágenes.
Incluye servidor HTTP local para previsualizar sin errores CORS.

Uso:
  python scraper.py <url> [--depth N] [--output DIR]
  python scraper.py --serve [--output DIR] [--port 8080]
"""

import os
import re
import sys
import time
import argparse
import http.server
import socketserver
from urllib.parse import urljoin, urlparse, urlunparse
from pathlib import Path
from collections import deque

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Instalando dependencias...")
    os.system(f"{sys.executable} -m pip install requests beautifulsoup4 --quiet")
    import requests
    from bs4 import BeautifulSoup


# ──────────────────────────────────────────────
#  Helpers de rutas  (fix: sin dominio duplicado)
# ──────────────────────────────────────────────

def url_to_rel_path(url: str) -> str:
    p = urlparse(url)
    netloc = p.netloc.split(":")[0]
    path = p.path.lstrip("/")

    if path == "" or path.endswith("/"):
        path = path + "index.html"
    elif "." not in Path(path).name:
        path = path + "/index.html"

    if p.query:
        safe_q = re.sub(r'[^a-zA-Z0-9_\-]', '_', p.query)[:40]
        stem = Path(path).stem
        suffix = Path(path).suffix or ".html"
        path = str(Path(path).parent / f"{stem}_{safe_q}{suffix}")

    return f"{netloc}/{path}"


def url_to_local_path(url: str, base_dir: Path) -> Path:
    return base_dir / url_to_rel_path(url)


def same_domain(url: str, base: str) -> bool:
    return urlparse(url).netloc == urlparse(base).netloc


def normalize_url(url: str) -> str:
    p = urlparse(url)
    return urlunparse((p.scheme, p.netloc, p.path or "/", "", "", ""))


# ──────────────────────────────────────────────
#  HTTP Session
# ──────────────────────────────────────────────

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
})


def download(url: str, dest: Path, retries: int = 3) -> bytes | None:
    if dest.exists():
        return dest.read_bytes()
    for attempt in range(retries):
        try:
            r = SESSION.get(url, timeout=20, stream=True)
            r.raise_for_status()
            dest.parent.mkdir(parents=True, exist_ok=True)
            content = r.content
            dest.write_bytes(content)
            return content
        except requests.RequestException as e:
            if attempt == retries - 1:
                print(f"  ✗ {url}  →  {e}")
                return None
            time.sleep(1)


# ──────────────────────────────────────────────
#  CSS: reescribir url() y descargar recursos
# ──────────────────────────────────────────────

def rewrite_css_urls(css_text: str, css_url: str, base_dir: Path) -> str:
    pattern = re.compile(r'url\(\s*["\']?([^)"\']+?)["\']?\s*\)', re.IGNORECASE)

    def replace(m):
        src = m.group(1).strip()
        if src.startswith("data:") or src.startswith("#"):
            return m.group(0)
        abs_url = urljoin(css_url, src)
        dest = url_to_local_path(abs_url, base_dir)
        download(abs_url, dest)
        css_dest = url_to_local_path(css_url, base_dir)
        try:
            rel = os.path.relpath(dest, css_dest.parent)
        except ValueError:
            rel = "/" + url_to_rel_path(abs_url)
        return f'url("{rel}")'

    return pattern.sub(replace, css_text)


def local_rel(target_url: str, from_html_path: Path, base_dir: Path) -> str:
    dest = url_to_local_path(target_url, base_dir)
    try:
        return os.path.relpath(dest, from_html_path.parent)
    except ValueError:
        return "/" + url_to_rel_path(target_url)


# ──────────────────────────────────────────────
#  Scraper principal
# ──────────────────────────────────────────────

def scrape(start_url: str, output_dir: str, max_depth: int, delay: float):
    base_dir = Path(output_dir)
    base_dir.mkdir(parents=True, exist_ok=True)

    visited_pages: set[str] = set()
    visited_assets: set[str] = set()
    queue: deque[tuple[str, int]] = deque([(normalize_url(start_url), 0)])
    stats = {"pages": 0, "css": 0, "js": 0, "images": 0, "errors": 0}

    print(f"\n🌐  Inicio  : {start_url}")
    print(f"📁  Destino : {base_dir.resolve()}")
    print(f"🔁  Depth   : {max_depth}\n")

    while queue:
        url, depth = queue.popleft()
        norm = normalize_url(url)
        if norm in visited_pages:
            continue
        visited_pages.add(norm)

        indent = "  " * depth
        print(f"{indent}[HTML] {url}")

        try:
            r = SESSION.get(url, timeout=20)
            r.raise_for_status()
        except requests.RequestException as e:
            print(f"{indent}  ✗ {e}")
            stats["errors"] += 1
            continue

        soup = BeautifulSoup(r.text, "html.parser")
        stats["pages"] += 1
        dest_html = url_to_local_path(url, base_dir)

        # ── CSS externos ────────────────────────────────────────────────
        for tag in soup.find_all("link", rel=lambda v: v and "stylesheet" in v):
            href = tag.get("href")
            if not href or href.startswith("data:"):
                continue
            abs_url = urljoin(url, href)
            if abs_url not in visited_assets:
                visited_assets.add(abs_url)
                dest = url_to_local_path(abs_url, base_dir)
                content = download(abs_url, dest)
                if content:
                    try:
                        text = rewrite_css_urls(
                            content.decode("utf-8", errors="replace"), abs_url, base_dir
                        )
                        dest.write_text(text, encoding="utf-8")
                    except Exception:
                        pass
                    stats["css"] += 1
                    print(f"{indent}  📄 CSS  {abs_url}")
            tag["href"] = local_rel(abs_url, dest_html, base_dir)

        # ── <style> inline ──────────────────────────────────────────────
        for style in soup.find_all("style"):
            if style.string:
                style.string = rewrite_css_urls(style.string, url, base_dir)

        # ── JS (<script src=...>) ───────────────────────────────────────
        for tag in soup.find_all("script", src=True):
            src = tag["src"]
            if src.startswith("data:"):
                continue
            abs_url = urljoin(url, src)
            if abs_url not in visited_assets:
                visited_assets.add(abs_url)
                dest = url_to_local_path(abs_url, base_dir)
                ok = download(abs_url, dest)
                if ok:
                    stats["js"] += 1
                    print(f"{indent}  ⚙️  JS   {abs_url}")
            tag["src"] = local_rel(abs_url, dest_html, base_dir)

        # ── Imágenes ────────────────────────────────────────────────────
        for tag in soup.find_all(["img", "source", "video", "input"]):
            for attr in ("src", "data-src", "poster"):
                val = tag.get(attr)
                if not val or val.startswith("data:"):
                    continue
                abs_url = urljoin(url, val)
                if abs_url not in visited_assets:
                    visited_assets.add(abs_url)
                    dest = url_to_local_path(abs_url, base_dir)
                    ok = download(abs_url, dest)
                    if ok:
                        stats["images"] += 1
                        print(f"{indent}  🖼  IMG  {abs_url}")
                tag[attr] = local_rel(abs_url, dest_html, base_dir)

            srcset = tag.get("srcset")
            if srcset:
                new_parts = []
                for part in srcset.split(","):
                    part = part.strip()
                    if not part:
                        continue
                    tokens = part.split()
                    img_url = urljoin(url, tokens[0])
                    if img_url not in visited_assets:
                        visited_assets.add(img_url)
                        dest = url_to_local_path(img_url, base_dir)
                        ok = download(img_url, dest)
                        if ok:
                            stats["images"] += 1
                    local = local_rel(img_url, dest_html, base_dir)
                    new_parts.append(f"{local} {' '.join(tokens[1:])}" if len(tokens) > 1 else local)
                tag["srcset"] = ", ".join(new_parts)

        # ── Favicon / manifest ──────────────────────────────────────────
        for tag in soup.find_all("link", href=True):
            rel_attr = tag.get("rel", [])
            if any(r in rel_attr for r in ("icon", "shortcut icon", "apple-touch-icon", "manifest")):
                href = tag["href"]
                if href.startswith("data:"):
                    continue
                abs_url = urljoin(url, href)
                if abs_url not in visited_assets:
                    visited_assets.add(abs_url)
                    dest = url_to_local_path(abs_url, base_dir)
                    download(abs_url, dest)
                tag["href"] = local_rel(abs_url, dest_html, base_dir)

        # ── Next.js / Vite: chunks en /_next/static o /assets/ ─────────
        for chunk_path in re.findall(
            r'["\']((/_next|/assets)/[^"\']+\.(js|css))["\']', r.text
        ):
            abs_url = urljoin(url, chunk_path[0])
            if abs_url not in visited_assets:
                visited_assets.add(abs_url)
                dest = url_to_local_path(abs_url, base_dir)
                ok = download(abs_url, dest)
                if ok:
                    ext = Path(chunk_path[0]).suffix
                    stats["css" if ext == ".css" else "js"] += 1

        # ── Guardar HTML ────────────────────────────────────────────────
        dest_html.parent.mkdir(parents=True, exist_ok=True)
        dest_html.write_text(str(soup), encoding="utf-8")

        # ── Encolar páginas hijas ───────────────────────────────────────
        if depth < max_depth:
            for a in soup.find_all("a", href=True):
                next_url = normalize_url(urljoin(url, a["href"]))
                if (
                    same_domain(next_url, start_url)
                    and next_url not in visited_pages
                    and urlparse(next_url).scheme in ("http", "https")
                    and not re.search(r'\.(pdf|zip|exe|dmg|tar\.gz)$', next_url, re.I)
                ):
                    queue.append((next_url, depth + 1))

        if delay:
            time.sleep(delay)

    # ── Resumen ─────────────────────────────────────────────────────────
    domain = urlparse(start_url).netloc
    print("\n" + "─" * 55)
    print("✅  Extracción completada")
    print(f"   Páginas HTML : {stats['pages']}")
    print(f"   CSS          : {stats['css']}")
    print(f"   JS           : {stats['js']}")
    print(f"   Imágenes     : {stats['images']}")
    print(f"   Errores      : {stats['errors']}")
    print(f"   Carpeta      : {(base_dir / domain).resolve()}")
    print("─" * 55)
    print(f"\n💡  Previsualizar sin CORS:")
    print(f"   python scraper.py --serve --output {output_dir}\n")


# ──────────────────────────────────────────────
#  Servidor local (fix CORS al abrir file://)
# ──────────────────────────────────────────────

def serve(output_dir: str, port: int):
    directory = Path(output_dir).resolve()
    if not directory.exists():
        print(f"❌  Carpeta no encontrada: {directory}")
        sys.exit(1)

    os.chdir(directory)

    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, fmt, *args):
            pass

    with socketserver.TCPServer(("", port), Handler) as httpd:
        print(f"\n🚀  Servidor en http://localhost:{port}")
        print(f"📁  Sirviendo: {directory}")
        for d in sorted(directory.iterdir()):
            if d.is_dir():
                print(f"   → http://localhost:{port}/{d.name}/")
        print("\nCtrl+C para detener.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n⏹  Servidor detenido.")


# ──────────────────────────────────────────────
#  CLI
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Extrae HTML, CSS, JS e imágenes de un sitio web.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python scraper.py https://shots.so
  python scraper.py https://shots.so --depth 2 --output ./sitio
  python scraper.py --serve --output ./sitio --port 8080
        """,
    )
    parser.add_argument("url", nargs="?", help="URL de inicio")
    parser.add_argument("--depth", "-d", type=int, default=1)
    parser.add_argument("--output", "-o", default="./sitio_descargado")
    parser.add_argument("--delay", type=float, default=0.0)
    parser.add_argument("--serve", "-s", action="store_true",
                        help="Levantar servidor local para previsualizar")
    parser.add_argument("--port", "-p", type=int, default=8080)

    args = parser.parse_args()

    if args.serve:
        serve(args.output, args.port)
        return

    if not args.url:
        parser.print_help()
        sys.exit(1)

    p = urlparse(args.url)
    if not p.scheme or not p.netloc:
        print("❌  URL inválida. Incluye el protocolo: https://ejemplo.com")
        sys.exit(1)

    scrape(args.url, args.output, args.depth, args.delay)


if __name__ == "__main__":
    main()