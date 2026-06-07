import pandas as pd
import numpy as np
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'database'))

from sqlalchemy import text
from connection import engine
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# Keyword-based auto-labeler (since scraped data has no labels)
def auto_label(title, description):
    text = (str(title) + " " + str(description)).lower()
    if any(k in text for k in ["data engineer", "etl", "pipeline", "spark", "airflow", "kafka"]):
        return "Data Engineering"
    elif any(k in text for k in ["machine learning", "ml engineer", "deep learning", "nlp", "ai engineer"]):
        return "AI Engineering"
    elif any(k in text for k in ["data scientist", "data science", "analytics", "statistician"]):
        return "Data Science"
    elif any(k in text for k in ["devops", "ci/cd", "kubernetes", "docker", "sre", "infrastructure"]):
        return "DevOps"
    elif any(k in text for k in ["cloud", "aws", "azure", "gcp", "cloud engineer"]):
        return "Cloud Engineering"
    else:
        return "Software Engineering"

def train_classifier():
    print("📊 Loading jobs from database...")
    df = pd.read_sql("SELECT title, description FROM jobs", engine)

    if len(df) < 10:
        print("❌ Not enough data. Run the scraper first.")
        return

    df["label"] = df.apply(lambda r: auto_label(r["title"], r["description"]), axis=1)
    df["text"]  = df["title"].fillna("") + " " + df["description"].fillna("")

    print("🏷️  Label distribution:")
    print(df["label"].value_counts())

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["label"], test_size=0.2, random_state=42
    )

    vectorizer = TfidfVectorizer(max_features=1000, stop_words="english")
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec  = vectorizer.transform(X_test)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_vec, y_train)

    y_pred = model.predict(X_test_vec)
    print("\n📈 Classification Report:")
    print(classification_report(y_test, y_pred))

    os.makedirs("models", exist_ok=True)
    joblib.dump(model,      "models/job_classifier.pkl")
    joblib.dump(vectorizer, "models/job_classifier_vectorizer.pkl")
    print("✅ Job classifier saved to ml/models/")

def predict_category(title, description):
    model      = joblib.load("models/job_classifier.pkl")
    vectorizer = joblib.load("models/job_classifier_vectorizer.pkl")
    text = str(title) + " " + str(description)
    vec  = vectorizer.transform([text])
    return model.predict(vec)[0]

if __name__ == "__main__":
    train_classifier()