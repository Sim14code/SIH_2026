import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# ==========================================
# XGBoost Risk Prediction Model (Standalone)
# ==========================================
# This script demonstrates how to train a basic XGBoost 
# classifier for predicting terrain risk (e.g., Landslide/Flood probability)
# based on features like rainfall, soil moisture, elevation, etc.
# 
# Usage:
#   python xgboost_risk_prediction.py
# ==========================================

def generate_synthetic_data(num_samples=1000):
    """
    Generates a synthetic dataset for demonstration purposes.
    In a real scenario, this would be replaced by a pd.read_csv() or DB query.
    """
    np.random.seed(42)
    
    # Features
    rainfall_mm = np.random.uniform(0, 300, num_samples)
    soil_moisture = np.random.uniform(0, 100, num_samples)
    elevation_m = np.random.uniform(10, 3500, num_samples)
    slope_angle = np.random.uniform(0, 60, num_samples)
    vegetation_index = np.random.uniform(0, 1, num_samples)
    
    # Target: 0 (Low Risk), 1 (Moderate Risk), 2 (High Risk)
    # Synthetic logic to create some correlation
    risk_score = (
        (rainfall_mm / 300) * 0.4 + 
        (soil_moisture / 100) * 0.3 + 
        (slope_angle / 60) * 0.4 - 
        (vegetation_index) * 0.2
    )
    
    y = np.zeros(num_samples, dtype=int)
    y[risk_score > 0.4] = 1 # Moderate
    y[risk_score > 0.7] = 2 # High
    
    X = pd.DataFrame({
        'rainfall_mm': rainfall_mm,
        'soil_moisture': soil_moisture,
        'elevation_m': elevation_m,
        'slope_angle': slope_angle,
        'vegetation_index': vegetation_index
    })
    
    return X, y

def main():
    print("1. Generating synthetic risk data...")
    X, y = generate_synthetic_data(2000)
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("2. Initializing XGBoost Classifier...")
    # Initialize XGBoost classifier
    model = xgb.XGBClassifier(
        objective='multi:softprob',
        num_class=3,
        eval_metric='mlogloss',
        max_depth=5,
        learning_rate=0.1,
        n_estimators=100,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    
    print("3. Training the model...")
    # Train the model
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )
    
    print("4. Evaluating the model...")
    # Predict on test set
    y_pred = model.predict(X_test)
    
    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Low Risk', 'Moderate Risk', 'High Risk']))
    
    # Feature importance
    feature_importances = model.feature_importances_
    print("Feature Importances:")
    for feature, importance in zip(X.columns, feature_importances):
        print(f" - {feature}: {importance:.4f}")
        
    print("\n5. Saving model for future inference...")
    # Save the model
    model_dir = "models"
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    model_path = os.path.join(model_dir, "xgboost_risk_model.joblib")
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    print("\n6. Example Inference...")
    # Load model and run an example prediction
    loaded_model = joblib.load(model_path)
    
    sample_data = pd.DataFrame([{
        'rainfall_mm': 150.0,
        'soil_moisture': 80.0,
        'elevation_m': 1200.0,
        'slope_angle': 45.0,
        'vegetation_index': 0.3
    }])
    
    pred_class = loaded_model.predict(sample_data)[0]
    pred_probs = loaded_model.predict_proba(sample_data)[0]
    
    risk_labels = ['Low Risk', 'Moderate Risk', 'High Risk']
    print(f"Sample Input:\n{sample_data.to_string(index=False)}")
    print(f"Predicted Class: {risk_labels[pred_class]}")
    print(f"Probabilities: {dict(zip(risk_labels, pred_probs))}")

if __name__ == "__main__":
    main()
