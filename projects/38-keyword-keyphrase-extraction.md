# Project 38: Unsupervised Keyword & Keyphrase Extraction with TF-IDF

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | N-gram TF-IDF Salience Scoring |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Scientific AI Research Abstracts |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Automatically extract the most descriptive unigram and bigram keyphrases from technical literature without supervision.

---

## 2. Theoretical Foundations
TF-IDF scores word importance relative to an entire corpus. Words that appear frequently in a specific article but rarely across other articles receive high weights:
$$\text{Score}(t) = \text{TF}(t, d) \times \text{IDF}(t)$$
Filtering by top TF-IDF weights isolates distinctive subject-matter keyphrases.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `N-gram TF-IDF Salience Scoring` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

article = """
Reinforcement learning agents learn optimal decision-making policies through trial-and-error 
interaction with a dynamic environment. Using deep neural networks as function approximators, 
deep Q-networks and policy gradient algorithms have demonstrated superhuman performance in 
complex games and robotics manipulation. Reward shaping and exploration strategies such as 
epsilon-greedy exploration guide the agent toward maximizing cumulative long-term returns.
"""

# Vectorize with unigrams and bigrams
vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
tfidf_matrix = vectorizer.fit_transform([article])

feature_names = vectorizer.get_feature_names_out()
scores = tfidf_matrix.toarray()[0]

top_indices = scores.argsort()[:-11:-1]
top_keywords = pd.DataFrame({
    'Keyphrase': [feature_names[i] for i in top_indices],
    'TFIDF_Score': np.round([scores[i] for i in top_indices], 4)
})

print("Top 10 Extracted Keyphrases:\n")
print(top_keywords.to_string(index=False))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Extracts high-value technical terms: 'reinforcement learning', 'policy gradient', 'deep neural'.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Compare with graph-based Keyphrase extraction (TextRank).
- [ ] Incorporate Part-of-Speech (POS) tagging to restrict keywords to noun phrases.

---

## Navigation
- **Previous Project**: [E-Commerce Review Star Rating Predictor with LinearSVC](./37-product-review-rating-predictor.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Toxic Online Comment Flagger with Cost-Sensitive Modeling](./39-toxic-comment-flagger.md)
