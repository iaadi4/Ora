from fastapi import FastAPI, File, UploadFile, HTTPException
import whisper
import uuid
import os
import shutil
import asyncio
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()
model = whisper.load_model("base")
executor = ThreadPoolExecutor()

@app.post("/transcribe")
async def transcribe(file: UploadFile = File()):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid audio file")

    filename = f"temp_{uuid.uuid4().hex}.mp3"
    with open(filename, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(executor, model.transcribe, filename)
        return {"text": result["text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(filename)
