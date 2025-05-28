from fastapi import FastAPI, File, UploadFile, HTTPException
import whisper
import tempfile
import shutil
import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from transformers import pipeline

app = FastAPI()

model = whisper.load_model("tiny.en")
executor = ThreadPoolExecutor()
emotion_analyzer = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True
)

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid audio file")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(executor, model.transcribe, tmp_path)
        text = result["text"]

        emotions = emotion_analyzer(text)[0]
        top_emotion = max(emotions, key=lambda e: e['score'])

        return {
            "text": text,
            "top_emotion": top_emotion,
            "all_emotions": emotions
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)
