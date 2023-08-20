from fastapi import FastAPI, HTTPException
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*']
    )
]

app = FastAPI(middleware=middleware)

# Get all compliant logs
@app.get("/api/compliantlogs")
async def get_compliant_logs():
    db_connection = sqlite3.connect("logs.db")
    db_cursor = db_connection.cursor()
    
    db_cursor.execute('SELECT * FROM compliantlogs')
    column_names = [desc[0] for desc in db_cursor.description]
    compliant_logs = [dict(zip(column_names, row)) for row in db_cursor.fetchall()]
    
    db_connection.close()
    
    return compliant_logs

# Get all non-compliant logs
@app.get("/api/noncompliantlogs")
async def get_noncompliant_logs():
    db_connection = sqlite3.connect("logs.db")
    db_cursor = db_connection.cursor()
    
    db_cursor.execute('SELECT * FROM noncompliantlogs')
    column_names = [desc[0] for desc in db_cursor.description]
    noncompliant_logs = [dict(zip(column_names, row)) for row in db_cursor.fetchall()]
    
    db_connection.close()
    
    return noncompliant_logs


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=5000)
