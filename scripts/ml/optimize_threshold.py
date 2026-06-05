import pandas as pd
import pickle
import numpy as np
from sklearn.metrics import precision_score, recall_score

def optimize_threshold():
    # 1. Load Model and Data
    with open('ml/models/fog_model_v1.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('ml/models/features_v1.pkl', 'rb') as f:
        features = pickle.load(f)
        
    df = pd.read_csv('ml/data/metar_enhanced_ml.csv')
    df = df.dropna(subset=features + ['is_disrupted'])
    
    X = df[features].apply(pd.to_numeric)
    y = df['is_disrupted']
    
    # Get probabilities for the entire dataset (or validation split, but we'll use all for a holistic view)
    probs = model.predict_proba(X)[:, 1]
    
    thresholds = [0.4, 0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9]
    results = []
    
    print(f"{'Threshold':<10} {'Precision':<10} {'Recall':<10} {'F1-Score':<10} {'False Alarms':<15}")
    print("-" * 60)
    
    for t in thresholds:
        preds = (probs >= t).astype(int)
        precision = precision_score(y, preds)
        recall = recall_score(y, preds)
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        # False Alarms = Predicted 1 but actual 0
        false_alarms = ((preds == 1) & (y == 0)).sum()
        
        results.append({
            "threshold": t,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "false_alarms": false_alarms
        })
        
        print(f"{t:<10.2f} {precision:<10.4f} {recall:<10.4f} {f1:<10.4f} {false_alarms:<15}")

    # Decision logic: We want high recall (don't miss cancellations) but reasonable precision.
    # At 0.65 - 0.75 usually we find a sweet spot.
    
if __name__ == "__main__":
    optimize_threshold()
