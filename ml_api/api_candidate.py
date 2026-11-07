
import joblib
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "svm_candidate_v1.joblib"

THRESHOLD = 0.0622

model = joblib.load(MODEL_PATH)

app = FastAPI(
    title="PhishGuard Candidate SVM API",
    description="Candidate SVM email text classification",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://cybershield-email-phishing.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailRequest(BaseModel):
    email: str


@app.get("/")
def home():
    return {
        "status": "success",
        "message": "PhishGuard Candidate SVM API is running"
    }


@app.post("/predict")
def predict_email(request: EmailRequest):
    email = request.email.strip()

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email text cannot be empty"
        )

    score = float(model.decision_function([email])[0])
    prediction = 1 if score >= THRESHOLD else 0

    result = "Spam" if prediction == 1 else "Legitimate"

    return {
        "prediction": result,
        "model": "Candidate SVM",
        "decision_score": round(score, 6),
        "threshold": THRESHOLD
    }
