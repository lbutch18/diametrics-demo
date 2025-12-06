from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from joblib import load
import numpy as np
import pandas as pd

app = FastAPI()

# Enable CORS so frontend can call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://diametrics-demo.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],  # Frontend URLs (production and local development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy load models to reduce memory usage at startup
risk_model = None
diagnosis_model = None

def get_risk_model():
    global risk_model
    if risk_model is None:
        import os
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        risk_model = load(os.path.join(backend_dir, 'rf_reg_100_diabetes_model.joblib'))
        print("Risk model loaded successfully!")
    return risk_model

def get_diagnosis_model():
    global diagnosis_model
    if diagnosis_model is None:
        import os
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        diagnosis_model = load(os.path.join(backend_dir, 'rf_diabetes_model.joblib'))
        print("Diagnosis model loaded successfully!")
    return diagnosis_model

# Define what data we expect from frontend for risk score prediction
class PredictionInput(BaseModel):
    family_history_diabetes: int
    age: int
    physical_activity_minutes_per_week: int  # This will be weekly minutes
    bmi: float
    diet_score: float
    screen_time_hours_per_day: float
    sleep_hours_per_day: float

# Define what data we expect from frontend for diagnosis classification
class DiagnosisInput(BaseModel):
    age: int
    gender: int
    ethnicity: int
    education_level: int
    income_level: int
    employment_status: int
    smoking_status: int
    alcohol_consumption_per_week: float
    physical_activity_minutes_per_week: int
    diet_score: float
    sleep_hours_per_day: float
    screen_time_hours_per_day: float
    family_history_diabetes: int
    hypertension_history: int
    cardiovascular_history: int
    bmi: float
    waist_to_hip_ratio: float
    systolic_bp: float
    diastolic_bp: float
    heart_rate: float
    cholesterol_total: float
    hdl_cholesterol: float
    ldl_cholesterol: float
    triglycerides: float
    glucose_fasting: float
    glucose_postprandial: float
    insulin_level: float
    hba1c: float

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "ML Model API is running"}

# Risk score prediction endpoint
@app.post("/predict")
async def predict(data: PredictionInput):
    # Convert input data to DataFrame
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
    
    # Make prediction (lazy load model if needed)
    model = get_risk_model()
    prediction = model.predict(features)
    
    return {
        "prediction": int(prediction[0]),
    }

# Diagnosis classification endpoint
@app.post("/diagnose")
async def diagnose(data: DiagnosisInput):
    try:
        # Use model's expected feature order (lazy load model if needed)
        model = get_diagnosis_model()
        feature_names = model.feature_names_in_
        
        # Create dictionary with all values
        feature_dict = {
            'age': data.age,
            'gender': data.gender,
            'ethnicity': data.ethnicity,
            'education_level': data.education_level,
            'income_level': data.income_level,
            'employment_status': data.employment_status,
            'smoking_status': data.smoking_status,
            'alcohol_consumption_per_week': data.alcohol_consumption_per_week,
            'physical_activity_minutes_per_week': data.physical_activity_minutes_per_week,
            'diet_score': data.diet_score,
            'sleep_hours_per_day': data.sleep_hours_per_day,
            'screen_time_hours_per_day': data.screen_time_hours_per_day,
            'family_history_diabetes': data.family_history_diabetes,
            'hypertension_history': data.hypertension_history,
            'cardiovascular_history': data.cardiovascular_history,
            'bmi': data.bmi,
            'waist_to_hip_ratio': data.waist_to_hip_ratio,
            'systolic_bp': data.systolic_bp,
            'diastolic_bp': data.diastolic_bp,
            'heart_rate': data.heart_rate,
            'cholesterol_total': data.cholesterol_total,
            'hdl_cholesterol': data.hdl_cholesterol,
            'ldl_cholesterol': data.ldl_cholesterol,
            'triglycerides': data.triglycerides,
            'glucose_fasting': data.glucose_fasting,
            'glucose_postprandial': data.glucose_postprandial,
            'insulin_level': data.insulin_level,
            'hba1c': data.hba1c
        }
        
        # Create DataFrame in the exact order the model expects
        features = pd.DataFrame([[feature_dict[col] for col in feature_names]], columns=feature_names)
        
        # Categorical columns need to be converted to strings matching the model's categories
        # Model categories: gender=['Female','Male','Other'], ethnicity=['Asian','Black','Hispanic','Other','White']
        # education=['Graduate','Highschool','No formal','Postgraduate'], income=['High','Low','Lower-Middle','Middle','Upper-Middle']
        # employment=['Employed','Retired','Student','Unemployed'], smoking=['Current','Former','Never']
        gender_map = {0: 'Male', 1: 'Female'}
        ethnicity_map = {0: 'White', 1: 'Black', 2: 'Hispanic', 3: 'Asian', 4: 'Other'}
        education_map = {0: 'No formal', 1: 'Highschool', 2: 'Graduate', 3: 'Graduate', 4: 'Postgraduate'}
        income_map = {0: 'Low', 1: 'Lower-Middle', 2: 'Middle', 3: 'Upper-Middle', 4: 'High'}
        employment_map = {0: 'Unemployed', 1: 'Employed', 2: 'Employed', 3: 'Retired'}
        smoking_map = {0: 'Never', 1: 'Former', 2: 'Current'}
        
        # Convert categorical columns to their string values
        if 'gender' in features.columns:
            features['gender'] = features['gender'].map(gender_map).fillna('Other')
        if 'ethnicity' in features.columns:
            features['ethnicity'] = features['ethnicity'].map(ethnicity_map).fillna('Other')
        if 'education_level' in features.columns:
            features['education_level'] = features['education_level'].map(education_map).fillna('Highschool')
        if 'income_level' in features.columns:
            features['income_level'] = features['income_level'].map(income_map).fillna('Middle')
        if 'employment_status' in features.columns:
            features['employment_status'] = features['employment_status'].map(employment_map).fillna('Unemployed')
        if 'smoking_status' in features.columns:
            features['smoking_status'] = features['smoking_status'].map(smoking_map).fillna('Never')
        
        # Convert other columns to proper types
        for col in feature_names:
            if col not in ['gender', 'ethnicity', 'education_level', 'income_level', 
                          'employment_status', 'smoking_status']:
                if col in ['age', 'physical_activity_minutes_per_week', 'family_history_diabetes',
                          'hypertension_history', 'cardiovascular_history']:
                    # Integer numeric columns
                    features[col] = features[col].astype('int64')
                else:
                    # Float columns
                    features[col] = features[col].astype('float64')
        
        # Make prediction (binary classification: 0 = No Diabetes, 1 = Diabetes)
        prediction = model.predict(features)
        
        return {
            "diagnosis": int(prediction[0]),
        }
    except Exception as e:
        import traceback
        error_msg = f"Error in diagnosis endpoint: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=str(e))