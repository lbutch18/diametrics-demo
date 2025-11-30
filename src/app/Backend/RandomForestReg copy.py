import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import sklearn as sk
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib
import time

time_start = time.time()
# Open data table to df
filepath = "data.csv"
df = pd.read_csv(filepath)

# Clean data
df = df.drop_duplicates()
df = df.dropna()
df = df.fillna("Unknown")

# Prepare features for encoding
categorical_features = ['gender', 'ethnicity', 'education_level', 'income_level', 
                       'employment_status', 'smoking_status']

# Encode categorical variables
from sklearn.preprocessing import LabelEncoder
encoders = {}
for feature in categorical_features:
    encoders[feature] = LabelEncoder()
    df[feature] = encoders[feature].fit_transform(df[feature])

# Select features for prediction
feature_columns = ['family_history_diabetes','age','physical_activity_minutes_per_week','bmi','diet_score','screen_time_hours_per_day','sleep_hours_per_day']

# Define target variable (predict diabetes_risk_score)
target = 'diabetes_risk_score'

# Prepare features (X) and target (y)
X = df[feature_columns]
y = df[target]

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train Random Forest Regressor
rf_model = RandomForestRegressor(
    n_estimators=100,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42
)

# Fit the model
rf_model.fit(X_train, y_train)

# Make predictions
predictions = rf_model.predict(X_test)

# Calculate performance metrics
mse = mean_squared_error(y_test, predictions)
rmse = np.sqrt(mse)
r2 = sk.metrics.r2_score(y_test, predictions)
percent_accuracy = 100 * (1 - (np.abs(y_test - predictions) / y_test).mean())
percent_error = sk.metrics.mean_absolute_percentage_error(y_test, predictions, sample_weight=None, multioutput='uniform_average')

print("\nModel Performance Metrics:")
print(f"Mean Squared Error: {mse:.4f}")
print(f"Root Mean Squared Error: {rmse:.4f}")
print(f"R-squared Score: {r2:.4f}")
print(f"Percent Accuracy: {percent_accuracy:.2f}%")
print(f"Mean Absolute Percentage Error: {percent_error:.4f}")


# Get feature importance
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': rf_model.feature_importances_
})
feature_importance = feature_importance.sort_values('importance', ascending=False)

print("\n Feature Importance:")
print(feature_importance.head(len(feature_columns)))

# Save the trained model
joblib.dump(rf_model, "rf_reg_100_diabetes_model.pkl", compress = 9)
print("Model saved as rf_ref_100_diabetes_model.pkl")

time_end = time.time()
print(f"\nTotal Execution Time: {time_end - time_start:.2f} seconds")
