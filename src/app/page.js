'use client'
import { useState } from 'react'


export default function MyApp() {
  const [activeTab, setActiveTab] = useState('risk');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function getRiskSubmission(formData) {
    setIsLoading(true);
    setPrediction(null);
    
    const familyHistory = parseInt(formData.get("familyHistory"));
    const age = parseInt(formData.get("age"));
    const physicalActivity = parseInt(formData.get("physicalActivity"))*7;
    const bmi = parseFloat(formData.get("bmi"));
    const dietScore = parseFloat(formData.get("dietScore"));
    const screenTime = parseFloat(formData.get("screenTime"));
    const sleepHours = parseFloat(formData.get("sleepHours"));

    try{
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        family_history_diabetes: familyHistory,
        age: age,
        physical_activity_minutes_per_week: physicalActivity,
        bmi: bmi,
        diet_score: dietScore,
        screen_time_hours_per_day: screenTime,
        sleep_hours_per_day: sleepHours,
      })});
      
      const result = await response.json();
      setPrediction(result.prediction);
      setIsLoading(false);
    } catch (error) {
      alert("Error fetching prediction. Please try again.");
      setIsLoading(false);
      setPrediction(null);
      return;
    }
  }

  async function getDiagnosisSubmission(formData) {
    setIsLoading(true);
    setPrediction(null);
    
    try{
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Helper function to safely parse values
      const getInt = (name) => {
        const val = formData.get(name);
        if (val === null || val === '') return 0;
        return parseInt(val) || 0;
      };
      
      const getFloat = (name) => {
        const val = formData.get(name);
        if (val === null || val === '') return 0;
        return parseFloat(val) || 0;
      };

      const requestBody = {
        age: getInt("age"),
        gender: getInt("gender"),
        ethnicity: getInt("ethnicity"),
        education_level: getInt("education_level"),
        income_level: getInt("income_level"),
        employment_status: getInt("employment_status"),
        smoking_status: getInt("smoking_status"),
        alcohol_consumption_per_week: getFloat("alcohol_consumption_per_week"),
        physical_activity_minutes_per_week: getInt("physical_activity_minutes_per_week"),
        diet_score: getFloat("diet_score"),
        sleep_hours_per_day: getFloat("sleep_hours_per_day"),
        screen_time_hours_per_day: getFloat("screen_time_hours_per_day"),
        family_history_diabetes: getInt("family_history_diabetes"),
        hypertension_history: getInt("hypertension_history"),
        cardiovascular_history: getInt("cardiovascular_history"),
        bmi: getFloat("bmi"),
        waist_to_hip_ratio: getFloat("waist_to_hip_ratio"),
        systolic_bp: getFloat("systolic_bp"),
        diastolic_bp: getFloat("diastolic_bp"),
        heart_rate: getFloat("heart_rate"),
        cholesterol_total: getFloat("cholesterol_total"),
        hdl_cholesterol: getFloat("hdl_cholesterol"),
        ldl_cholesterol: getFloat("ldl_cholesterol"),
        triglycerides: getFloat("triglycerides"),
        glucose_fasting: getFloat("glucose_fasting"),
        glucose_postprandial: getFloat("glucose_postprandial"),
        insulin_level: getFloat("insulin_level"),
        hba1c: getFloat("hba1c"),
      };

      const response = await fetch(`${API_URL}/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`Server error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const result = await response.json();
      setPrediction(result.diagnosis);
      setIsLoading(false);
    } catch (error) {
      alert("Error fetching diagnosis. Please try again.");
      setIsLoading(false);
      setPrediction(null);
      return;
    }
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">DiaMetrics Demo</h1>
          <p className="text-gray-600 mb-6">
            {activeTab === 'risk' 
              ? 'Please fill out the form below, then press submit to see your risk score!' 
              : 'Please fill out the form below, then press submit to see your diagnosis classification!'}
          </p>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('risk');
                setPrediction(null);
              }}
              className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                activeTab === 'risk'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Risk Score Prediction
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('diagnosis');
                setPrediction(null);
              }}
              className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                activeTab === 'diagnosis'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Diagnosis Classification
            </button>
          </div>

          {/* Risk Score Form */}
          {activeTab === 'risk' && (
            <form onSubmit={(e) => { e.preventDefault(); getRiskSubmission(new FormData(e.target)); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diabetes in family history?
            </label>
            <select 
              name="familyHistory" 
              id="familyHistory"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How old are you?
            </label>
            <input 
              type="number" 
              name="age" 
              id="age"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many minutes of physical activity do you get per day?
            </label>
            <input 
              type="number" 
              name="physicalActivity" 
              id="physicalActivity"
              min="0"
              max="1440"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What is your BMI?
            </label>
            <input 
              type="number" 
              step="0.1"
              name="bmi" 
              id="bmi"
              min="10"
              max="50"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Self-rate how balanced your diet is on a scale of 1-10:
            </label>
            <input 
              type="number" 
              name="dietScore" 
              id="dietScore"
              step=".1"
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many hours of screen time per day?
            </label>
            <input 
              type="number" 
              step="0.5"
              min="0"
              max="24"
              name="screenTime" 
              id="screenTime"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many hours of sleep do you get per day?
            </label>
            <input 
              type="number" 
              step="0.5"
              min="0"
              max="24"
              name="sleepHours" 
              id="sleepHours"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Submit'}
          </button>
        </form>
          )}

          {/* Diagnosis Classification Form */}
          {activeTab === 'diagnosis' && (
            <form onSubmit={(e) => { e.preventDefault(); getDiagnosisSubmission(new FormData(e.target)); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input 
                  type="number" 
                  name="age" 
                  id="age"
                  min="0"
                  defaultValue="45"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select 
                  name="gender" 
                  id="gender"
                  defaultValue="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ethnicity
                </label>
                <select 
                  name="ethnicity" 
                  id="ethnicity"
                  defaultValue="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">Caucasian</option>
                  <option value="1">African American</option>
                  <option value="2">Hispanic</option>
                  <option value="3">Asian</option>
                  <option value="4">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level
                </label>
                <select 
                  name="education_level" 
                  id="education_level"
                  defaultValue="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">Less than High School</option>
                  <option value="1">High School</option>
                  <option value="2">Some College</option>
                  <option value="3">Bachelor's Degree</option>
                  <option value="4">Graduate Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income Level
                </label>
                <select 
                  name="income_level" 
                  id="income_level"
                  defaultValue="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">Low</option>
                  <option value="1">Lower-Middle</option>
                  <option value="2">Middle</option>
                  <option value="3">Upper-Middle</option>
                  <option value="4">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Status
                </label>
                <select 
                  name="employment_status" 
                  id="employment_status"
                  defaultValue="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">Unemployed</option>
                  <option value="1">Part-time</option>
                  <option value="2">Full-time</option>
                  <option value="3">Retired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smoking Status
                </label>
                <select 
                  name="smoking_status" 
                  id="smoking_status"
                  defaultValue="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">Never</option>
                  <option value="1">Former</option>
                  <option value="2">Current</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alcohol Consumption (drinks per week)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  name="alcohol_consumption_per_week" 
                  id="alcohol_consumption_per_week"
                  defaultValue="2.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Activity (minutes per week)
                </label>
                <input 
                  type="number" 
                  min="0"
                  name="physical_activity_minutes_per_week" 
                  id="physical_activity_minutes_per_week"
                  defaultValue="150"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diet Score (1-10)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  min="1"
                  max="10"
                  name="diet_score" 
                  id="diet_score"
                  defaultValue="6.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Hours (per day)
                </label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0"
                  max="24"
                  name="sleep_hours_per_day" 
                  id="sleep_hours_per_day"
                  defaultValue="7"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screen Time (hours per day)
                </label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0"
                  max="24"
                  name="screen_time_hours_per_day" 
                  id="screen_time_hours_per_day"
                  defaultValue="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family History of Diabetes?
                </label>
                <select 
                  name="family_history_diabetes" 
                  id="family_history_diabetes"
                  defaultValue="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hypertension History?
                </label>
                <select 
                  name="hypertension_history" 
                  id="hypertension_history"
                  defaultValue="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardiovascular History?
                </label>
                <select 
                  name="cardiovascular_history" 
                  id="cardiovascular_history"
                  defaultValue="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BMI
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  min="10"
                  max="50"
                  name="bmi" 
                  id="bmi"
                  defaultValue="28.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waist to Hip Ratio
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="2"
                  name="waist_to_hip_ratio" 
                  id="waist_to_hip_ratio"
                  defaultValue="0.92"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Systolic Blood Pressure (mmHg)
                </label>
                <input 
                  type="number" 
                  step="1"
                  min="50"
                  max="250"
                  name="systolic_bp" 
                  id="systolic_bp"
                  defaultValue="135"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diastolic Blood Pressure (mmHg)
                </label>
                <input 
                  type="number" 
                  step="1"
                  min="30"
                  max="150"
                  name="diastolic_bp" 
                  id="diastolic_bp"
                  defaultValue="85"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart Rate (bpm)
                </label>
                <input 
                  type="number" 
                  step="1"
                  min="30"
                  max="200"
                  name="heart_rate" 
                  id="heart_rate"
                  defaultValue="72"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Cholesterol (mg/dL)
                </label>
                <input 
                  type="number" 
                  step="1"
                  min="50"
                  max="500"
                  name="cholesterol_total" 
                  id="cholesterol_total"
                  defaultValue="220"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HDL Cholesterol (mg/dL)
                </label>
                <input 
                  type="number" 
                  step="1"
                  min="10"
                  max="150"
                  name="hdl_cholesterol" 
                  id="hdl_cholesterol"
                  defaultValue="45"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LDL Cholesterol (mg/dL)
                </label>
                <input 
                  type="number" 
                  step="1"
                  min="0"
                  max="300"
                  name="ldl_cholesterol" 
                  id="ldl_cholesterol"
                  defaultValue="140"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Triglycerides (mg/dL)
                </label>
                <input 
                  type="number" 
                  step="1"
                  min="0"
                  max="1000"
                  name="triglycerides" 
                  id="triglycerides"
                  defaultValue="175"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasting Glucose (mg/dL)
                </label>
                <input 
                  type="number" 
                  step="1"
                  min="50"
                  max="300"
                  name="glucose_fasting" 
                  id="glucose_fasting"
                  defaultValue="110"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postprandial Glucose (mg/dL)
                </label>
                <input 
                  type="number" 
                  step="1"
                  min="50"
                  max="400"
                  name="glucose_postprandial" 
                  id="glucose_postprandial"
                  defaultValue="165"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insulin Level (μU/mL)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  max="100"
                  name="insulin_level" 
                  id="insulin_level"
                  defaultValue="12.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HbA1c (%)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  min="3"
                  max="15"
                  name="hba1c" 
                  id="hba1c"
                  defaultValue="6.2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Submit'}
              </button>
            </form>
          )}

          {/* Loading State - appears in same location as results */}
          {isLoading && (
            <div className="mt-8 p-8 bg-white rounded-lg shadow-xl">
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="animate-spin rounded-full h-24 w-24 border-4 border-indigo-100 border-t-indigo-600 mb-6"></div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  {activeTab === 'risk' 
                    ? 'Calculating your risk assessment...' 
                    : 'Analyzing your diagnosis...'}
                </p>
                <p className="text-sm text-gray-500">
                  Please wait while we process your information
                </p>
              </div>
            </div>
          )}

          {/* Risk Score Results */}
          {prediction !== null && !isLoading && activeTab === 'risk' && (
        <div className="mt-8 p-8 bg-white rounded-lg shadow-xl">
          {(() => {
          let riskLevel, riskColor, riskMessage;

        if (prediction < 23.8) {
          riskLevel = "Low Risk";
          riskColor = "#10b981";
          riskMessage = "Your diabetes risk is below average.";
        } else if (prediction < 29) {
          riskLevel = "Low-Moderate Risk";
          riskColor = "#fbbf24";
          riskMessage = "Your diabetes risk is slightly below average.";
        } else if (prediction < 35.6) {
          riskLevel = "Moderate Risk";
          riskColor = "#f97316";
          riskMessage = "Your diabetes risk is above average.";
        } else {
          riskLevel = "High Risk";
          riskColor = "#ef4444";
          riskMessage = "Your diabetes risk is very high.";
        }

      return (
        <div className="text-center">
          <div className="text-6xl font-bold mb-4" style={{color: riskColor}}>
            {prediction}
          </div>
          <h3 className="text-3xl font-bold mb-2" style={{color: riskColor}}>
            {riskLevel}
          </h3>
          <p className="text-gray-700 text-lg">{riskMessage}</p>
                    <p className="mt-4 text-gray-500">(This is for demonstration purposes only and is not medical advice.)</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Diagnosis Results */}
          {prediction !== null && !isLoading && activeTab === 'diagnosis' && (
            <div className="mt-8 p-8 bg-white rounded-lg shadow-xl">
              {(() => {
                const hasDiabetes = prediction === 1;
                const diagnosisText = hasDiabetes ? "Diabetes" : "No Diabetes";
                const diagnosisColor = hasDiabetes ? "#ef4444" : "#10b981";
                const diagnosisMessage = hasDiabetes 
                  ? "The model indicates a positive diabetes diagnosis." 
                  : "The model indicates no diabetes diagnosis.";

                return (
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-4" style={{color: diagnosisColor}}>
                      {diagnosisText}
                    </div>
                    <p className="text-gray-700 text-lg">{diagnosisMessage}</p>
                    <p className="mt-4 text-gray-500">(This is for demonstration purposes only and is not medical advice.)</p>
        </div>
      );
    })()}
  </div>
)}
      </div>
    </div>
  </div>
);
}
