import sys, json, os
import joblib

input_data = json.loads(sys.argv[1])
title       = input_data.get("title", "")
description = input_data.get("description", "")

model_dir  = os.path.join(os.path.dirname(__file__), "models")
model      = joblib.load(os.path.join(model_dir, "job_classifier.pkl"))
vectorizer = joblib.load(os.path.join(model_dir, "job_classifier_vectorizer.pkl"))

text   = title + " " + description
vec    = vectorizer.transform([text])
result = model.predict(vec)[0]

print(json.dumps({ "category": result }))