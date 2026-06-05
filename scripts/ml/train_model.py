import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_curve, auc
import pickle
import os

def train_fog_model():
    # 1. Load the enhanced dataset
    data_path = 'ml/data/metar_enhanced_ml.csv'
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found. Run feature_engineering.py first.")
        return

    df = pd.read_csv(data_path)
    
    # 2. Select features and target
    # We drop rows with missing values in our features
    features = ['temperature', 'dewpoint_depression', 'wind_speed', 'humidity', 'hour', 'month']
    target = 'is_disrupted'
    
    # Drop rows where critical features are missing
    df = df.dropna(subset=features + [target])
    
    X = df[features]
    y = df[target]
    
    # 3. Train/Test Split (stratified because classes are imbalanced)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set size: {len(X_train)}")
    print(f"Disruptions in training set: {y_train.sum()}")
    
    # 4. Handle class imbalance using scale_pos_weight
    # Ratio of negative to positive samples
    scale_weight = (len(y_train) - y_train.sum()) / y_train.sum()
    
    # 5. Initialize and train XGBoost
    model = xgb.XGBClassifier(
        max_depth=5,
        learning_rate=0.1,
        n_estimators=100,
        verbosity=1,
        objective='binary:logistic',
        scale_pos_weight=scale_weight,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # 6. Evaluation
    y_pred = model.predict(X_test)
    y_probs = model.predict_proba(X_test)[:, 1]
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    precision, recall, _ = precision_recall_curve(y_test, y_probs)
    pr_auc = auc(recall, precision)
    print(f"\nPrecision-Recall AUC: {pr_auc:.4f}")
    
    # 7. Feature Importance
    print("\nFeature Importances:")
    importances = model.feature_importances_
    for name, imp in zip(features, importances):
        print(f"{name}: {imp:.4f}")
        
    # 8. Save the model and feature list
    os.makedirs('ml/models', exist_ok=True)
    model_path = 'ml/models/fog_model_v1.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    with open('ml/models/features_v1.pkl', 'wb') as f:
        pickle.dump(features, f)
        
    print(f"\nModel saved to {model_path}")

if __name__ == "__main__":
    train_fog_model()
