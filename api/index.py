from api import app

# This is the entry point for Vercel serverless functions
# Vercel will automatically handle the ASGI/WSGI interface
handler = app

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)