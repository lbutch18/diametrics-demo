from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from joblib import load
import numpy as np
import pandas as pd

app = FastAPI()

# Enable CORS so frontend can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store model
model = None

# Load model when server starts
@app.on_event("startup")
async def load_model_on_startup():
    global model
    model = load('rf_reg_100_diabetes_model.joblib')
    print("Model loaded successfully!")

# Define what data we expect from frontend
class PredictionInput(BaseModel):
    family_history_diabetes: int
    age: int
    physical_activity_minutes_per_week: int  # This will be weekly minutes
    bmi: float
    diet_score: float
    screen_time_hours_per_day: float
    sleep_hours_per_day: float

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "ML Model API is running"}

# Prediction endpoint
@app.post("/predict")
async def predict(data: PredictionInput):
    # Convert input data to numpy array
    
    features = pd.DataFrame([[
    data.family_history_diabetes,
    data.age,
    data.physical_activity_minutes_per_week,
    data.bmi,
    data.diet_score,
    data.screen_time_hours_per_day,
    data.sleep_hours_per_day
]], columns=[
    'family_history_diabetes',
    'age',
    'physical_activity_minutes_per_week',
    'bmi',
    'diet_score',
    'screen_time_hours_per_day',
    'sleep_hours_per_day'
])
    
    # Make prediction
    prediction = model.predict(features)
    
    return {
        "prediction": int(prediction[0]),
    }