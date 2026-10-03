# Project 31: SMS Spam Filter with TF-IDF and Multinomial Naive Bayes

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | Multinomial Naive Bayes (MultinomialNB) & TfidfVectorizer |
| **Difficulty** | Beginner |
| **Recommended Dataset** | SMS Mobile Text Messages Benchmark Collection |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Filter unsolicited commercial SMS spam messages from legitimate personal messages using word frequency statistics and Bayes' rule.

---

## 2. Theoretical Foundations
Multinomial Naive Bayes models discrete term count frequencies:
$$P(c | d) \propto P(c) \prod_{t \in d} P(t | c)^{N_{d,t}}$$
**TF-IDF** (Term Frequency - Inverse Document Frequency) down-weights universally common words ('the', 'is') and elevates terms uniquely concentrated in spam ('cash', 'winner', 'free'):
$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \log\left(\frac{1 + N}{1 + \text{DF}(t)}\right)$$

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Multinomial Naive Bayes (MultinomialNB) & TfidfVectorizer` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

messages = [
    ("Hey are we still meeting for lunch today at 1?", "ham"),
    ("URGENT! You have won a $1,000 cash prize. Call 09061701461 to claim now!", "spam"),
    ("Can you please send me the notes from lecture yesterday?", "ham"),
    ("FREE entry in 2 a weekly competition to win FA Cup final tickets! Text FA to 87121", "spam"),
    ("Don't forget mom's birthday dinner tomorrow night at 7pm", "ham"),
    ("Congratulations! Your mobile number was awarded a prize. Reply CLAIM", "spam"),
    ("I'll be home in about twenty minutes, see you soon", "ham"),
    ("WINNER!! As a valued customer you have been selected to receive a £900 reward!", "spam"),
    ("What time does the train arrive at the station?", "ham"),
    ("Exclusive offer: Claim your free luxury cruise voucher today only!", "spam"),
    ("Let me know when you finish reviewing the proposal document", "ham"),
    ("Double your cash overnight! Guaranteed returns, visit link now", "spam")
]

df = pd.DataFrame(messages, columns=['Text', 'Label'])
X = df['Text']
y = df['Label'].map({'ham': 0, 'spam': 1})

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42, stratify=y)

# Pipeline: TF-IDF + MultinomialNB
model = make_pipeline(TfidfVectorizer(stop_words='english'), MultinomialNB(alpha=0.1))
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("Classification Report:\n", classification_report(y_test, y_pred, target_names=['Ham', 'Spam']))

# Test on fresh incoming unseen messages
test_samples = [
    "Hey dude, what's up for the weekend?",
    "YOU WON A FREE GIFT CARD! CLICK HERE IMMEDIATELY TO REDEEM"
]
preds = model.predict(test_samples)
probs = model.predict_proba(test_samples)[:, 1]

print("Inference on Unseen Texts:")
for text, pred, prob in zip(test_samples, preds, probs):
    lbl = 'SPAM' if pred == 1 else 'HAM'
    print(f"[{lbl} | Spam Prob: {prob*100:5.1f}%] "{text}"")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Precision and Recall for Spam > 95% on test samples.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Add sublinear_tf=True to scale term frequency logarithmically.
- [ ] Incorporate character n-grams to catch obfuscated spellings like 'w1nner'.

---

## Navigation
- **Previous Project**: [Industrial Sensor Drift Anomaly Detection with Local Outlier Factor](./30-sensor-drift-detection-lof.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Movie Review Sentiment Analysis with Logistic Regression](./32-movie-review-sentiment-analysis.md)
