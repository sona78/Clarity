# Import the FastAPI app directly
import sys
import os

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from api import app
    # This is the entry point for Vercel serverless functions
    # Vercel will automatically handle the ASGI/WSGI interface
    handler = app
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback - create a simple FastAPI app for debugging
    from fastapi import FastAPI
    handler = FastAPI()
    
    @handler.get("/")
    async def root():
        return {"error": "Failed to import main app", "message": str(e)}

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)