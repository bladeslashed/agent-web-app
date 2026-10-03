# Project 40: FAQ Query Intent Matcher with Cosine Similarity

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | TF-IDF Vector Space Intent Matching |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Customer Service Knowledgebase FAQ Database |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Map incoming user customer support questions to the best matching knowledgebase answer using vector cosine similarity.

---

## 2. Theoretical Foundations
Information retrieval vector space models represent the knowledgebase as a matrix of TF-IDF vectors. Incoming queries $q$ are transformed into the same vector space, and the answer associated with the maximum cosine similarity $\arg\max_i \cos(q, d_i)$ is retrieved.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `TF-IDF Vector Space Intent Matching` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

faq_database = [
    {"intent": "Reset Password", "faq": "How do I reset my account password if forgotten?", "answer": "Click 'Forgot Password' on the login screen to receive a secure password reset link via email."},
    {"intent": "Track Shipment", "faq": "Where is my package and how can I track order delivery?", "answer": "Log into your account and visit 'Order History' to view real-time carrier tracking information."},
    {"intent": "Return Policy", "faq": "What is the refund and item return policy window?", "answer": "Items in original condition can be returned within 30 days of delivery for a full refund."},
    {"intent": "Billing Update", "faq": "How do I change my credit card payment method or billing address?", "answer": "Go to 'Account Settings' -> 'Billing' to update credit cards and payment preferences."}
]

faq_df = pd.DataFrame(faq_database)

vectorizer = TfidfVectorizer(stop_words='english')
faq_matrix = vectorizer.fit_transform(faq_df['faq'])

def match_query(user_query, threshold=0.25):
    query_vec = vectorizer.transform([user_query])
    similarities = cosine_similarity(query_vec, faq_matrix)[0]
    best_idx = np.argmax(similarities)
    best_score = similarities[best_idx]
    
    if best_score < threshold:
        return "I'm sorry, I could not find a relevant answer in our FAQ. Would you like to speak to a human representative?"
    
    matched = faq_df.iloc[best_idx]
    return f"Matched Intent: {matched['intent']} (Score: {best_score:.2f})\nAnswer: {matched['answer']}"

# Test queries
print("Query 1: 'I forgot my login password, help!'")
print(match_query("I forgot my login password, help!"))

print("\nQuery 2: 'Can I send back a damaged shirt for a refund?'")
print(match_query("Can I send back a damaged shirt for a refund?"))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Resolves user phrasing to the appropriate FAQ intent with similarity scores > 0.40.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Set a fallback confidence threshold to route uncertain questions to human agents.
- [ ] Compare with dense neural retrieval using sentence-transformers.

---

## Navigation
- **Previous Project**: [Toxic Online Comment Flagger with Cost-Sensitive Modeling](./39-toxic-comment-flagger.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Handwritten Digit Recognition with Multi-Layer Perceptron (MLP)](./41-mnist-handwritten-digit-recognition.md)
