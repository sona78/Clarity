from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Test API endpoint working", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

handler = app