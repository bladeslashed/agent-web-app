# Project 37: E-Commerce Review Star Rating Predictor with LinearSVC

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | Linear Support Vector Classifier (LinearSVC) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Customer E-Commerce Review Texts & Star Ratings (1-5) |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Predict customer star ratings (1 to 5 stars) from raw textual review comments using multi-class linear support vector machines.

---

## 2. Theoretical Foundations
Multi-class `LinearSVC` fits One-vs-Rest (OvR) hyperplanes using coordinate descent or LibLinear. It finds maximal margin decision surfaces in sparse high-dimensional text space, providing robust regularization against vocabulary noise.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Linear Support Vector Classifier (LinearSVC)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, mean_absolute_error

data = [
    ("Completely broken upon arrival, unusable junk, refund requested.", 1),
    ("Terrible quality, broke within two days of normal use.", 1),
    ("Mediocre product. Works okay but feels very cheap and flimsy.", 2),
    ("Below average, lacks several features promised in the description.", 2),
    ("Decent for the price. Does the job as expected, nothing special.", 3),
    ("Average item. Not bad, not great, fair value.", 3),
    ("Very good product! Good build quality, fast delivery, satisfied.", 4),
    ("Solid purchase, works nicely and meets all my expectations.", 4),
    ("Absolutely fantastic! Exceeded all expectations, premium quality!", 5),
    ("Best purchase I have made all year! Highly recommended to everyone!", 5)
]

df = pd.DataFrame(data, columns=['Text', 'Rating'])
X = df['Text']
y = df['Rating']

pipe = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
    ('svc', LinearSVC(C=1.0, random_state=42))
])
pipe.fit(X, y)

test_samples = [
    "Awful item, waste of hard earned money.",
    "Decent and satisfactory, works as advertised.",
    "Superb quality, absolutely love it, perfection!"
]

preds = pipe.predict(test_samples)
for text, rating in zip(test_samples, preds):
    print(f"[{rating} Stars] "{text}"")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Predictions align with human intuition: negative ~1-2, neutral ~3, laudatory ~5.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Treat star ratings as an ordinal regression problem.
- [ ] Compute continuous regression predictions with LinearSVR.

---

## Navigation
- **Previous Project**: [Resume & Job Description Matcher with Cosine Similarity](./36-resume-job-description-matcher.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Unsupervised Keyword & Keyphrase Extraction with TF-IDF](./38-keyword-keyphrase-extraction.md)
