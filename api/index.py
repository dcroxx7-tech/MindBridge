import sys
import os

backend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from main import app as original_app

async def app(scope, receive, send):
    if scope["type"] in ("http", "websocket"):
        path = scope.get("path", "")
        if not path.startswith("/api"):
            scope["path"] = "/api" + path
    await original_app(scope, receive, send)
