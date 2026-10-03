# Project 21: Customer Segmentation with K-Means & The Elbow Method

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Clustering |
| **Algorithm** | K-Means Clustering, Inertia & Silhouette Analysis |
| **Difficulty** | Beginner |
| **Recommended Dataset** | E-Commerce Customer Annual Spending & Visit Frequency |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Segment retail customers into distinct marketing personas using unsupervised centroid clustering and determine optimal K.

---

## 2. Theoretical Foundations
K-Means partitions $N$ observations into $K$ clusters such that within-cluster sum of squares (Inertia) is minimized:
$$J = \sum_{k=1}^K \sum_{x \in C_k} ||x - \mu_k||^2$$
The **Elbow Method** plots inertia across values of $K$ to identify the point of diminishing returns.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `K-Means Clustering, Inertia & Silhouette Analysis` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# 1. Synthesize 4 Distinct Customer Personas
np.random.seed(42)
# Budget / Casual
c1 = np.random.normal([25, 20], [5, 4], (150, 2))
# High Earners / Low Spenders (Careful)
c2 = np.random.normal([80, 25], [6, 5], (120, 2))
# Young / High Spenders (Impulse)
c3 = np.random.normal([35, 80], [7, 6], (130, 2))
# VIP Whales (High Income, High Spending)
c4 = np.random.normal([85, 85], [6, 5], (100, 2))

X_raw = np.vstack([c1, c2, c3, c4])
df = pd.DataFrame(X_raw, columns=['AnnualIncome_k', 'SpendingScore_1_100'])

scaler = StandardScaler()
X = scaler.fit_transform(df)

# 2. Elbow Method Search
inertias = []
silhouette_scores = []
k_range = range(2, 8)

for k in k_range:
    km = KMeans(n_clusters=k, n_init=10, random_state=42)
    km.fit(X)
    inertias.append(km.inertia_)
    silhouette_scores.append(silhouette_score(X, km.labels_))

print("K-Selection Telemetry:")
for k, inrt, sil in zip(k_range, inertias, silhouette_scores):
    print(f"K={k} | Inertia: {inrt:8.2f} | Silhouette Score: {sil:.4f}")

# 3. Fit Optimal Model (K=4)
optimal_k = 4
final_kmeans = KMeans(n_clusters=optimal_k, n_init=10, random_state=42)
df['Cluster'] = final_kmeans.fit_predict(X)

print("\nCluster Centroid Personas:")
print(df.groupby('Cluster').mean())
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Silhouette score peaks at K=4 with score > 0.65.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Plot clusters and centroids with Matplotlib scatter plot.
- [ ] Compare K-Means against Gaussian Mixture Models (GMM) with soft cluster probabilities.

---

## Navigation
- **Previous Project**: [Mushroom Edibility Identification with Rule-Based Decision Trees](./20-mushroom-edibility-classification.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Hierarchical Consumer Profiling with Agglomerative Clustering](./22-mall-customer-hierarchical-clustering.md)
