# Servidor local para testar como no ar: gzip no HTML/CSS/JS/SVG e cache longa nos ficheiros com hash.
# Porta 4192 (fora da lista bloqueada do WebKit). python -I servir.py
import http.server, functools, os, gzip, io
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=RAIZ, **k)
    def log_message(s, *a): pass
    def send_head(s):
        caminho = s.translate_path(s.path)
        if os.path.isdir(caminho): caminho = os.path.join(caminho, 'index.html')
        texto = caminho.endswith(('.html', '.css', '.js', '.svg', '.xml', '.txt', '.json'))
        if not (texto and 'gzip' in s.headers.get('Accept-Encoding', '') and os.path.isfile(caminho)):
            return super().send_head()
        corpo = gzip.compress(open(caminho, 'rb').read(), 6)
        s.send_response(200); s.send_header('Content-Type', s.guess_type(caminho)); s.send_header('Content-Encoding', 'gzip')
        s.send_header('Content-Length', str(len(corpo))); s.send_header('Cache-Control', 'no-cache'); s.end_headers()
        return io.BytesIO(corpo)
    def end_headers(s):
        if '/assets/' in s.path or '/img/' in s.path or '/fontes/' in s.path: s.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        super().end_headers()
http.server.ThreadingHTTPServer(('127.0.0.1', 4192), H).serve_forever()
