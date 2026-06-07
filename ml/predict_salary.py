import sys, json, os
import joblib

input_data = json.loads(sys.argv[1])
title    = input_data.get("title", "")
location = input_data.get("location", "")
skills   = input_data.get("skills", "")

model_dir  = os.path.join(os.path.dirname(__file__), "models")
model      = joblib.load(os.path.join(model_dir, "salary_predictor.pkl"))
vectorizer = joblib.load(os.path.join(model_dir, "salary_predictor_vectorizer.pkl"))

text      = f"{title} {location} {skills}"
vec       = vectorizer.transform([text])
predicted = model.predict(vec)[0]

print(json.dumps({
    "estimated_salary": round(float(predicted), 2),
    "range_min":        round(float(predicted) * 0.85, 2),
    "range_max":        round(float(predicted) * 1.15, 2)
}))