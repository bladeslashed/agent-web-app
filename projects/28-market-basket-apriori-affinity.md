# Project 28: Supermarket Basket Association Mining with Apriori Affinity

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Association Rules |
| **Algorithm** | Frequent Itemsets, Support, Confidence, and Lift |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Simulated Point-of-Sale Grocery Transactions |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Discover purchase affinities (e.g. Diapers and Beer) in customer transactions using Support, Confidence, and Lift metrics.

---

## 2. Theoretical Foundations
Association rule mining identifies relationships of the form $X \implies Y$:
- **Support**: $P(X \cap Y)$ (frequency of occurrence)
- **Confidence**: $P(Y | X) = \frac{\text{Support}(X \cap Y)}{\text{Support}(X)}$
- **Lift**: $\frac{P(X \cap Y)}{P(X)P(Y)}$ (strength of rule over random co-occurrence; Lift > 1 indicates strong affinity).

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Frequent Itemsets, Support, Confidence, and Lift` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from itertools import combinations

# 1. Synthesize 500 Market Basket Transactions
np.random.seed(42)
items = ['Milk', 'Bread', 'Eggs', 'Butter', 'Beer', 'Diapers', 'Coffee', 'Cereal']
transactions = []

for _ in range(500):
    basket = set()
    # Embedded rule 1: Bread and Butter
    if np.random.rand() < 0.40:
        basket.update(['Bread', 'Butter'])
    # Embedded rule 2: Beer and Diapers
    if np.random.rand() < 0.25:
        basket.update(['Beer', 'Diapers'])
    # Random additional grocery additions
    basket.update(np.random.choice(items, size=np.random.randint(1, 4), replace=False))
    transactions.append(list(basket))

# 2. Compute Item Support
n_tx = len(transactions)
item_counts = {}
pair_counts = {}

for t in transactions:
    for item in t:
        item_counts[item] = item_counts.get(item, 0) + 1
    for pair in combinations(sorted(t), 2):
        pair_counts[pair] = pair_counts.get(pair, 0) + 1

# 3. Generate Association Rules
rules = []
min_support = 0.08
min_confidence = 0.50

for (a, b), count in pair_counts.items():
    supp_ab = count / n_tx
    if supp_ab < min_support:
        continue
    supp_a = item_counts[a] / n_tx
    supp_b = item_counts[b] / n_tx
    
    # Rule a -> b
    conf_a_to_b = supp_ab / supp_a
    lift_a_to_b = conf_a_to_b / supp_b
    if conf_a_to_b >= min_confidence:
        rules.append({'Rule': f"{a} => {b}", 'Support': supp_ab, 'Confidence': conf_a_to_b, 'Lift': lift_a_to_b})

    # Rule b -> a
    conf_b_to_a = supp_ab / supp_b
    lift_b_to_a = conf_b_to_a / supp_a
    if conf_b_to_a >= min_confidence:
        rules.append({'Rule': f"{b} => {a}", 'Support': supp_ab, 'Confidence': conf_b_to_a, 'Lift': lift_b_to_a})

df_rules = pd.DataFrame(rules).sort_values(by='Lift', ascending=False)
print("Top Association Rules Discovered:\n")
print(df_rules.to_string(index=False))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Discovers strong Lift (> 1.6) for Bread <=> Butter and Beer <=> Diapers.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Scale to 3-item combinations (triplets).
- [ ] Integrate with the mlxtend library apriori and association_rules modules.

---

## Navigation
- **Previous Project**: [Network Intrusion & Zero-Day Detection with One-Class SVM](./27-network-intrusion-anomaly-one-class-svm.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Text Topic Discovery with Latent Dirichlet Allocation (LDA)](./29-document-topic-modeling-lda.md)
