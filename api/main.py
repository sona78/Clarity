from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import sys
import os
import asyncio

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class handler(BaseHTTPRequestHandler):
    def _handle_request(self, method):
        """Handle HTTP requests by routing to FastAPI"""
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        try:
            # Read request body for POST/PUT requests
            content_length = int(self.headers.get('Content-Length', 0))
            body_data = self.rfile.read(content_length) if content_length > 0 else b''
            
            # Try to import and use the FastAPI app
            try:
                from api import app
                
                # Create ASGI scope
                scope = {
                    'type': 'http',
                    'method': method,
                    'path': path,
                    'query_string': parsed_path.query.encode(),
                    'headers': [(k.lower().encode(), v.encode()) for k, v in self.headers.items()],
                    'server': ('localhost', 80),
                    'client': ('127.0.0.1', 0),
                }
                
                # Handle request through FastAPI
                response = asyncio.run(self._call_fastapi(app, scope, body_data))
                self.wfile.write(response.encode())
                
            except ImportError as import_error:
                # Fallback if FastAPI can't be imported (missing env vars, etc.)
                if path == '/' or path == '' or path == '/api/' or path == '/api':
                    response = {
                        "message": "Cascading Career Milestone API v3.0 - Limited Mode",
                        "status": "Limited functionality (missing environment configuration)",
                        "import_error": str(import_error),
                        "note": "Configure environment variables to enable full API functionality",
                        "expected_endpoints": {
                            "generate_plan": "POST /api/v3/generate-plan/{username}",
                            "update_cascade": "PUT /api/v3/milestone/{timeframe}/{username}/update-cascade",
                            "direct_update": "PUT /api/v3/milestone/{timeframe}/{username}/direct-update",
                            "regenerate_subsequent": "POST /api/v3/plan/{username}/regenerate-subsequent",
                            "process_thoughts": "POST /api/v3/milestone/{timeframe}/{username}/process-thoughts"
                        },
                        "setup_instructions": {
                            "step1": "Set EXA_API_KEY environment variable in Vercel dashboard",
                            "step2": "Set REACT_APP_SUPABASE_URL environment variable",
                            "step3": "Set REACT_APP_SUPABASE_ANON_KEY environment variable",
                            "step4": "Redeploy to activate full functionality"
                        }
                    }
                else:
                    response = {
                        "error": "Endpoint not available",
                        "message": f"FastAPI import failed for path: {path}",
                        "method": method,
                        "import_error": str(import_error),
                        "note": "Configure environment variables to enable full API functionality"
                    }
                
                self.wfile.write(json.dumps(response, indent=2).encode())
                
            except Exception as e:
                # Handle other errors
                error_response = {
                    "error": "API Error",
                    "message": str(e),
                    "path": path,
                    "method": method,
                    "type": type(e).__name__
                }
                self.wfile.write(json.dumps(error_response, indent=2).encode())
                
        except Exception as e:
            # Final fallback
            error_response = {
                "error": "Handler Error",
                "message": str(e),
                "path": path,
                "method": method
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    async def _call_fastapi(self, app, scope, body_data):
        """Call FastAPI application through ASGI interface"""
        response_data = {
            'status': 200,
            'headers': [],
            'body': ''
        }
        
        # Simple ASGI receive callable
        async def receive():
            return {
                'type': 'http.request',
                'body': body_data,
                'more_body': False
            }
        
        # Simple ASGI send callable
        async def send(message):
            if message['type'] == 'http.response.start':
                response_data['status'] = message.get('status', 200)
                response_data['headers'] = message.get('headers', [])
            elif message['type'] == 'http.response.body':
                body = message.get('body', b'')
                if isinstance(body, bytes):
                    response_data['body'] += body.decode('utf-8')
                else:
                    response_data['body'] += str(body)
        
        try:
            # Call the FastAPI app
            await app(scope, receive, send)
            return response_data['body']
        except Exception as e:
            error_response = {
                "error": "FastAPI execution error",
                "message": str(e),
                "type": type(e).__name__,
                "path": scope.get('path', 'unknown')
            }
            return json.dumps(error_response, indent=2)
    
    def do_GET(self):
        """Handle GET requests"""
        self._handle_request('GET')
    
    def do_POST(self):
        """Handle POST requests"""
        self._handle_request('POST')
    
    def do_PUT(self):
        """Handle PUT requests"""
        self._handle_request('PUT')
    
    def do_DELETE(self):
        """Handle DELETE requests"""
        self._handle_request('DELETE')
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(b'')

    def log_message(self, format, *args):
        """Override to prevent default logging"""
        pass