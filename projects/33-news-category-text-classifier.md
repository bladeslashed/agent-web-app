# Project 33: News Article Topic Categorization with SGDClassifier

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | Stochastic Gradient Descent (Linear SVM via SGDClassifier) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Scikit-Learn 20 Newsgroups Benchmark Subset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Classify multi-topic news articles into Science, Religion, Graphics, and Politics using online linear classifiers in an end-to-end pipeline.

---

## 2. Theoretical Foundations
`SGDClassifier` implements regularized linear models (Linear SVM with hinge loss) using stochastic gradient descent updates:
$$w \leftarrow w - \eta \left( \nabla L_i(w) + \alpha w \right)$$
This enables streaming out-of-core learning capable of scaling to hundreds of thousands of long-form articles in seconds.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Stochastic Gradient Descent (Linear SVM via SGDClassifier)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

categories = ['rec.sport.baseball', 'sci.space', 'comp.graphics', 'talk.politics.mideast']
news_train = fetch_20newsgroups(subset='train', categories=categories, shuffle=True, random_state=42)
news_test = fetch_20newsgroups(subset='test', categories=categories, shuffle=True, random_state=42)

print(f"Training Documents: {len(news_train.data)}")
print(f"Testing Documents: {len(news_test.data)}")

# Create Scikit-learn Pipeline
text_clf = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english', max_features=10000)),
    ('clf', SGDClassifier(loss='hinge', penalty='l2', alpha=1e-4, max_iter=50, random_state=42))
])

text_clf.fit(news_train.data, news_train.target)
y_pred = text_clf.predict(news_test.data)

print(f"\nOverall Test Accuracy: {accuracy_score(news_test.target, y_pred) * 100:.2f}%\n")
print(classification_report(news_test.target, y_pred, target_names=news_train.target_names))

# Interactive Test
sample_headline = ["NASA's James Webb Space Telescope discovers ancient distant galaxy"]
pred_cat = news_train.target_names[text_clf.predict(sample_headline)[0]]
print(f"Headline: '{sample_headline[0]}'\nPredicted Category: {pred_cat}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Test Accuracy > 90% across the 4 thematic categories.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Use partial_fit to simulate live online data streams.
- [ ] Tune alpha regularization parameter using GridSearchCV.

---

## Navigation
- **Previous Project**: [Movie Review Sentiment Analysis with Logistic Regression](./32-movie-review-sentiment-analysis.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Online Misinformation & Fake News Detector](./34-fake-news-detector.md)
