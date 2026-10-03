# Project 39: Toxic Online Comment Flagger with Cost-Sensitive Modeling

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | Logistic Regression with Balanced Class Weights |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Public Forum User Comments |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Flag hostile, abusive, and toxic online comments to automate community content moderation queues.

---

## 2. Theoretical Foundations
Online toxicity is rare (< 5% of forum posts). Using standard classifiers leads to high false negative rates. Incorporating `class_weight='balanced'` scales the penalty for missed toxic comments inversely to their occurrence, prioritizing community safety.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Logistic Regression with Balanced Class Weights` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix

comments = [
    ("Thanks for sharing this informative tutorial, really helped me!", 0),
    ("Great explanation, looking forward to the next part.", 0),
    ("I disagree with your point, but good discussion nonetheless.", 0),
    ("Could you elaborate on the second code block?", 0),
    ("Awesome project, starred the repository on GitHub.", 0),
    ("You are an absolute idiot and know nothing about programming, get lost!", 1),
    ("Shut up you moron, this is the dumbest video on the internet.", 1),
    ("Stop posting your garbage content, you are useless.", 1)
]

df = pd.DataFrame(comments, columns=['Text', 'IsToxic'])
X = df['Text']
y = df['IsToxic']

pipe = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
    ('clf', LogisticRegression(class_weight='balanced', random_state=42))
])
pipe.fit(X, y)

test_posts = [
    "Thank you for the quick assistance and code review.",
    "You are so stupid and your advice is completely pathetic."
]

preds = pipe.predict(test_posts)
probs = pipe.predict_proba(test_posts)[:, 1]

for text, pred, prob in zip(test_posts, preds, probs):
    status = "TOXIC / FLAGGED" if pred == 1 else "CLEAN"
    print(f"[{status:16s} | Toxic Prob: {prob*100:5.1f}%] "{text}"")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Correctly flags abusive language while allowing benign technical discourse.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Implement multi-label classification across toxicity subtypes (threat, insult, obscenity).
- [ ] Evaluate character n-grams to bypass leetspeak and obfuscated profanity.

---

## Navigation
- **Previous Project**: [Unsupervised Keyword & Keyphrase Extraction with TF-IDF](./38-keyword-keyphrase-extraction.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [FAQ Query Intent Matcher with Cosine Similarity](./40-faq-intent-matching-engine.md)
