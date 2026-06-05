import pandas as pd
import pickle

def explain_prediction(row, prob, features):
    reasons = []
    
    # Heuristic explanations based on feature importances and meteorology
    if row['dewpoint_depression'] <= 1.0:
        reasons.append(f"diferență minimă temp/punct rouă ({row['dewpoint_depression']}°C)")
    elif row['dewpoint_depression'] <= 2.0:
        reasons.append("atmosferă aproape de saturație")
        
    if row['humidity'] >= 95:
        reasons.append(f"umiditate extremă ({row['humidity']}%)")
    elif row['humidity'] >= 90:
        reasons.append("umiditate ridicată")
        
    if row['wind_speed'] <= 3:
        reasons.append(f"vânt calm ({row['wind_speed']} kt)")
    elif row['wind_speed'] <= 6:
        reasons.append("vânt slab")
        
    if 0 <= row['hour'] <= 7:
        reasons.append("interval critic de radiație matinală")

    explanation = " + ".join(reasons) if reasons else "condiții meteo standard"
    return f"{prob:.0%} risc deoarece {explanation}."

def run_explainability_demo():
    # 1. Load Model and Features
    with open('ml/models/fog_model_v1.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('ml/models/features_v1.pkl', 'rb') as f:
        features = pickle.load(f)
        
    df = pd.read_csv('ml/data/metar_enhanced_ml.csv')
    
    # 2. Pick some interesting lines for the demo
    # Line 9524 from previous check (high risk)
    # Plus a morning one with high humidity
    demo_indices = [9522, 27030, 500] 
    
    print("=== AERLY EXPLAINABILITY ENGINE (PREVIEW) ===\n")
    
    for idx in demo_indices:
        if idx >= len(df): continue
        row = df.iloc[idx]
        X = row[features].to_frame().T.apply(pd.to_numeric)
        prob = model.predict_proba(X)[0][1]
        
        explanation = explain_prediction(row, prob, features)
        
        print(f"TIMESTAMP: {row['timestamp']}")
        print(f"DATA: Temp={row['temperature']}°C, DewpDep={row['dewpoint_depression']}°C, Humidity={row['humidity']}%, Wind={row['wind_speed']}kt")
        print(f"EXPLANATION: {explanation}")
        print("-" * 50)

if __name__ == "__main__":
    run_explainability_demo()
