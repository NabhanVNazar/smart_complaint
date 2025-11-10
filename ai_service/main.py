from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

# Initialize the Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# --- Professional ML Model Training Pipeline ---

# 1. Load the dataset
try:
    df = pd.read_csv('dataset.csv')
    # Simple data cleaning
    df.dropna(inplace=True)
    df['features'] = df['text'] + ' ' + df['location'] + ' ' + df['state']
except FileNotFoundError:
    print("FATAL ERROR: dataset.csv not found. Please ensure it is in the ai_service directory.")
    exit()

# 2. Define Features (X) and Target (y)
X = df['features']
y = df['department']

# 3. Create a full machine learning pipeline
# This pipeline handles text vectorization and model training in one step.
model_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('clf', LogisticRegression(random_state=42, max_iter=1000)) # A robust and standard classifier
])

# 4. Train the ML Model
# The pipeline learns from the entire dataset. This is the "training" step.
model_pipeline.fit(X, y)

print("AI Model trained successfully on the dataset.")

def classify_complaint(complaint_text, location):
    """
    This function uses the trained ML model to predict the department.
    """
    # The model was trained on a combined feature set, so we create that for prediction.
    # A more advanced system would parse state/district from the location string.
    # For the hackathon, we'll assume the location string itself is a useful feature.
    prediction_features = f"{complaint_text} {location}"
    
    # Use the trained pipeline to predict the department
    predicted_department = model_pipeline.predict([prediction_features])[0]
    
    # Determine Severity based on keywords (a simple, effective rule-based system)
    severity_map = {
        "S": ["power", "electricity", "outage", "exploded", "failure"],
        "A": ["water", "sewage", "leaking", "dirty", "hospital", "health"],
        "B": ["waste", "garbage", "clean", "parking", "broken", "road", "pothole"]
    }
    severity = "C" # Default
    for sev, keywords in severity_map.items():
        if any(keyword in complaint_text.lower() for keyword in keywords):
            severity = sev
            break
            
    return {"department": predicted_department, "severity": severity}

@app.route('/classify', methods=['POST'])
def classify():
    data = request.get_json()
    if not data or 'text' not in data or 'location' not in data:
        return jsonify({"error": "Invalid input, 'text' and 'location' fields are required."}), 400
    
    result = classify_complaint(data['text'], data['location'])
    return jsonify(result)

if __name__ == '__main__':
    # Run the AI service on port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)