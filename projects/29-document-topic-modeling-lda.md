# Project 29: Text Topic Discovery with Latent Dirichlet Allocation (LDA)

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Topic Modeling |
| **Algorithm** | Latent Dirichlet Allocation (LDA) & CountVectorizer |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Research Paper Abstracts |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Extract latent semantic themes across a corpus of documents without manual labeling using probabilistic generative topic models.

---

## 2. Theoretical Foundations
LDA posits that documents are mixtures of latent topics, and topics are mixtures of words. Each document $d$ has topic proportions $\theta_d \sim \text{Dir}(\alpha)$, and each topic $k$ has word distributions $\phi_k \sim \text{Dir}(\beta)$. Variational Bayes or Gibbs sampling infers the hidden topic structure.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Latent Dirichlet Allocation (LDA) & CountVectorizer` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation

# 1. Corpus of 12 documents across 3 distinct domains (AI, Medicine, Finance)
documents = [
    "deep learning neural networks backpropagation gradient descent optimization algorithm",
    "convolutional vision models transformer attention weights computer vision dataset",
    "reinforcement learning agent policy reward q learning bellman environment",
    "neural representations embeddings training loss transformers speech recognition",
    
    "clinical trial patient oncology immunotherapy chemotherapy tumor remission",
    "cardiovascular disease blood pressure hypertension cholesterol patient treatment",
    "vaccine immune response antibody viral pathogen clinical diagnosis",
    "pediatric medical treatment dosage clinical pharmacology hospital patient",
    
    "equity market stock portfolio asset allocation return dividend volatility",
    "bond yield central bank inflation interest rate monetary treasury",
    "derivative option hedge fund arbitrage leverage financial risk liquidity",
    "macroeconomic gdp unemployment trade fiscal debt capital banking"
]

# 2. Extract Term Frequency
vectorizer = CountVectorizer(stop_words='english')
tf_matrix = vectorizer.fit_transform(documents)
feature_names = vectorizer.get_feature_names_out()

# 3. Fit LDA with 3 Topics
lda = LatentDirichletAllocation(n_components=3, random_state=42)
lda.fit(tf_matrix)

# 4. Display Discovered Topics
print("Extracted Latent Topics:")
for idx, topic in enumerate(lda.components_):
    top_indices = topic.argsort()[:-7:-1]
    top_words = [feature_names[i] for i in top_indices]
    print(f"Topic #{idx + 1}: {', '.join(top_words)}")

# Document topic distribution for Document 0
doc0_topics = lda.transform(tf_matrix[0:1])[0]
print(f"\nDoc 0 ('Deep Learning...') Topic Distribution: {np.round(doc0_topics, 3)}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Isolates AI, Medical, and Financial keywords cleanly into distinct topics.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Measure topic coherence using the gensim library.
- [ ] Visualize topic clusters using pyLDAvis.

---

## Navigation
- **Previous Project**: [Supermarket Basket Association Mining with Apriori Affinity](./28-market-basket-apriori-affinity.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Industrial Sensor Drift Anomaly Detection with Local Outlier Factor](./30-sensor-drift-detection-lof.md)
