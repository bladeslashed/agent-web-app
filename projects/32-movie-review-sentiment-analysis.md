# Project 32: Movie Review Sentiment Analysis with Logistic Regression

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | Logistic Regression on Word n-grams |
| **Difficulty** | Beginner |
| **Recommended Dataset** | IMDb Film Critic Review Snippets |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Determine whether film reviews express positive or negative sentiment using word unigram and bigram features.

---

## 2. Theoretical Foundations
By modeling word pairs (bigrams like 'not good' vs 'not bad'), bag-of-words captures basic linguistic negation that individual words miss. Logistic regression learns positive weights for laudatory tokens ('brilliant', 'masterpiece') and negative weights for criticism ('dreadful', 'boring').

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Logistic Regression on Word n-grams` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

reviews = [
    ("An absolute masterpiece of modern cinema, brilliantly directed and acted.", 1),
    ("Dreadful waste of time. Poor script, terrible pacing, and lifeless acting.", 0),
    ("I loved every single minute of this movie, truly heart-warming and wonderful.", 1),
    ("Boring, predictable, and totally uninspired. Avoid at all costs.", 0),
    ("Visually stunning with breathtaking cinematography and exceptional performances.", 1),
    ("One of the worst films I have ever endured. Pure garbage.", 0),
    ("Hilarious and charming comedy with delightful chemistry between the leads.", 1),
    ("Painfully slow plot that goes nowhere. Disappointing mess.", 0),
    ("A triumph of storytelling that will stay with you for days.", 1),
    ("Completely unwatchable dialogue and cringe-worthy performances.", 0)
]

df = pd.DataFrame(reviews, columns=['Review', 'Sentiment'])
X = df['Review']
y = df['Sentiment']

# Extract Unigrams + Bigrams with TF-IDF
vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
X_vec = vectorizer.fit_transform(X)

clf = LogisticRegression()
clf.fit(X_vec, y)

# Inspect most polarized words
feature_names = vectorizer.get_feature_names_out()
coefs = clf.coef_[0]
top_pos = feature_names[coefs.argsort()[-4:]]
top_neg = feature_names[coefs.argsort()[:4]]

print("Most Positive Linguistic Cues:", list(top_pos))
print("Most Negative Linguistic Cues:", list(top_neg))

# Predict on new review
new_review = ["The movie was not good and had terrible pacing."]
pred = clf.predict(vectorizer.transform(new_review))[0]
prob = clf.predict_proba(vectorizer.transform(new_review))[0]
print(f"\nTest Review Sentiment: {'POSITIVE' if pred==1 else 'NEGATIVE'} (Pos Prob: {prob[1]*100:.1f}%)")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Polarity correctly identified with high confidence on held-out reviews.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Compare performance against VADER rule-based sentiment analyzer.
- [ ] Evaluate word embeddings (Word2Vec / GloVe) vs bag-of-words.

---

## Navigation
- **Previous Project**: [SMS Spam Filter with TF-IDF and Multinomial Naive Bayes](./31-sms-spam-ham-classifier.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [News Article Topic Categorization with SGDClassifier](./33-news-category-text-classifier.md)
