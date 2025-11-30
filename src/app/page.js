'use client'
import { useState } from 'react'


export default function MyApp() {
  const [prediction, setPrediction] = useState(null);
  async function getSubmission(formData) {
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
    } catch (error) {
      alert("Error fetching prediction. Please try again.");
      return;
    }

  }
return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">DiaMetrics Demo</h1>
        <p className="text-gray-600 mb-8">Please fill out the form below, then press submit to see your results!</p>
        
        <form action={getSubmission} className="space-y-6">
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
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg"
          >
            Submit
          </button>
        </form>
        {prediction && (
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
          <p className = "mt-4 text-gray-500"> (This is for demonstration purposes only and is not medical advice.)</p>
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


  