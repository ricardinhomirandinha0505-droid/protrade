# Servidor local para testar (porta 4192, fora da lista bloqueada do WebKit). python -I servir.py
import http.server, functools, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist'))
http.server.ThreadingHTTPServer(('127.0.0.1', 4192), functools.partial(http.server.SimpleHTTPRequestHandler)).serve_forever()
