from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

# Initialize the Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# --- AI Model "Training" on a Simulated Dataset ---
# This simulates loading and preparing data for a real AI model.
training_data = {
    'text': [
        "power outage and electricity failure in my area",
        "no water supply for three days",
        "garbage and waste not collected on main street",
        "potholes and broken road needs repair",
        "street lights are not working in the city center",
        "leaking pipe causing water wastage in Mumbai",
        "transformer exploded, immediate help needed in Delhi",
        "sewage overflow on the highway",
        "traffic signal is broken at the main intersection"
    ],
    'department': [
        "State Electricity Board",
        "State Water Supply",
        "District Waste Management",
        "State Public Works",
        "State Electricity Board",
        "State Water Supply",
        "State Electricity Board",
        "State Public Works",
        "Central Transport Authority"
    ]
}
df = pd.DataFrame(training_data)

# --- Create Department Profiles ---
# This is a more advanced approach. Instead of matching one complaint to another,
# we create a "profile" for each department based on all its related complaints.
department_profiles = {}
for department in df['department'].unique():
    # Combine all complaint texts for a single department
    department_texts = " ".join(df[df['department'] == department]['text'])
    department_profiles[department] = department_texts

# Use TF-IDF to convert our department profiles into numerical vectors
vectorizer = TfidfVectorizer()
department_vectors = vectorizer.fit_transform(department_profiles.values())

def classify_complaint(complaint_text, location_text):
    """
    This is our "trained" AI model.
    It classifies a complaint by scoring it against department profiles
    based on both text and location keywords.
    """
    input_vector = vectorizer.transform([complaint_text])
    
    # --- Text-Based Scoring ---
    # Calculate how similar the complaint text is to each department's profile
    text_similarities = (input_vector * department_vectors.T).toarray().flatten()
    
    # --- Location-Based Scoring (Simple but effective) ---
    # Give a score boost if the location name appears in the complaint text
    # (e.g., "water wastage in Mumbai" and location is "Mumbai")
    location_scores = [1 if loc.lower() in complaint_text.lower() else 0 for loc in ["mumbai", "delhi"]]
    
    # --- Combine Scores and Classify ---
    # We give more weight to the text, but location can be a tie-breaker.
    final_scores = (0.8 * text_similarities) + (0.2 * pd.Series(location_scores))
    best_department_index = final_scores.argmax()
    department = list(department_profiles.keys())[best_department_index]
    
    # --- Determine Severity ---
    severity_map = {"S": ["power", "electricity", "outage", "exploded"], "A": ["water", "sewage"], "B": ["waste", "garbage"]}
    severity = "C" # Default
    for sev, keywords in severity_map.items():
        if any(keyword in complaint_text.lower() for keyword in keywords):
            severity = sev
            break
            
    return {"department": department, "severity": severity}

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