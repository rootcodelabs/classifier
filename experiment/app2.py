from fastapi import FastAPI

app = FastAPI()

@app.get("/api2/endpoint1")
def read_root():
    return {"message": "Hello from API 2, Endpoint 1"}

@app.get("/api2/endpoint2")
def read_item():
    return {"message": "Hello from API 2, Endpoint 2"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
