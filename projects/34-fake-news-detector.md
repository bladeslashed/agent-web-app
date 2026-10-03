# Project 34: Online Misinformation & Fake News Detector

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | PassiveAggressiveClassifier & TfidfVectorizer |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Curated True vs Fabricated News Reports |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Detect fabricated misinformation articles using online Passive-Aggressive learning suited for volatile news streams.

---

## 2. Theoretical Foundations
Passive-Aggressive algorithms are online margin-based learners:
- **Passive**: If an incoming sample is correctly classified with margin $\ge 1$, parameters remain unchanged ($w_{t+1} = w_t$).
- **Aggressive**: If misclassified, it updates parameters aggressively to correct the loss while staying as close as possible to the previous weight vector.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `PassiveAggressiveClassifier & TfidfVectorizer` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import PassiveAggressiveClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix

articles = [
    ("Scientists discover new Earth-sized exoplanet orbiting nearby star within habitable zone", 1), # Real
    ("SECRET GOVERNMENT EXPERIMENT: Aliens control world leaders through radio towers in underground bunker", 0), # Fake
    ("Federal Reserve maintains benchmark interest rates following monetary policy meeting", 1), # Real
    ("Miracle fruit cures all known diseases in 24 hours, doctors stunned and pharmaceutical companies furious", 0), # Fake
    ("Department of Transportation announces $5 billion infrastructure grant for rail bridge upgrades", 1), # Real
    ("SHOCKING PROOF: Celebrities drinking youth elixir to stay alive forever uncovered in leak", 0), # Fake
    ("Automaker unveils new electric battery achieving 600 miles range on single charge", 1), # Real
    ("Celebrity secretly replaced by government robot clone after vanishing from public view", 0) # Fake
]

df = pd.DataFrame(articles, columns=['Text', 'IsReal'])
X = df['Text']
y = df['IsReal']

vectorizer = TfidfVectorizer(stop_words='english', max_df=0.9)
X_tfidf = vectorizer.fit_transform(X)

pac = PassiveAggressiveClassifier(max_iter=50, random_state=42)
pac.fit(X_tfidf, y)

test_samples = [
    "Economists warn of cooling housing market amid rising mortgage rates",
    "MAGIC WATER: Drinking this liquid reverses aging in 3 seconds guaranteed"
]
test_vec = vectorizer.transform(test_samples)
preds = pac.predict(test_vec)

for text, pred in zip(test_samples, preds):
    label = "REAL NEWS" if pred == 1 else "FAKE / MISINFORMATION"
    print(f"[{label:22s}] "{text}"")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Accurately distinguishes sensory clickbait exaggeration from factual reporting.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Incorporate headline sentiment polarity and capitalization ratio as auxiliary features.
- [ ] Compare PassiveAggressive with LogisticRegression and LinearSVC.

---

## Navigation
- **Previous Project**: [News Article Topic Categorization with SGDClassifier](./33-news-category-text-classifier.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Natural Language Identification with Character n-grams](./35-language-identification.md)
