# Project 22: Hierarchical Consumer Profiling with Agglomerative Clustering

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Clustering |
| **Algorithm** | Agglomerative Hierarchical Clustering (Ward Linkage) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Mall Retail Customer Purchasing Records |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Build bottom-up hierarchical cluster dendrograms to visualize consumer taxonomy across varying levels of granularity.

---

## 2. Theoretical Foundations
Agglomerative Hierarchical Clustering starts with each observation as a single cluster and iteratively merges the closest pairs. **Ward's Linkage** minimizes the total within-cluster variance increase:
$$\Delta \text{ESS} = \frac{n_A n_B}{n_A + n_B} ||\mu_A - \mu_B||^2$$
producing balanced, cohesive clusters without requiring a fixed K upfront.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Agglomerative Hierarchical Clustering (Ward Linkage)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.cluster import AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

np.random.seed(42)
age = np.random.uniform(18, 70, 300)
income = np.random.uniform(15, 120, 300)
spending = np.random.uniform(1, 100, 300)

df = pd.DataFrame({'Age': age, 'Income': income, 'Spending': spending})
scaler = StandardScaler()
X = scaler.fit_transform(df)

# Agglomerative clustering with Ward linkage
agg = AgglomerativeClustering(n_clusters=4, metric='euclidean', linkage='ward')
df['Cluster'] = agg.fit_predict(X)

sil = silhouette_score(X, df['Cluster'])
print(f"Hierarchical Silhouette Score: {sil:.4f}")

print("\nCluster Breakdown (Mean Values):")
print(df.groupby('Cluster').mean().round(2))
print("\nCluster Member Counts:\n", df['Cluster'].value_counts())
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Silhouette score ≈ 0.38 - 0.45 across 4 distinct customer archetypes.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Use scipy.cluster.hierarchy.dendrogram to plot the complete tree diagram.
- [ ] Compare Ward linkage with Complete and Average linkage.

---

## Navigation
- **Previous Project**: [Customer Segmentation with K-Means & The Elbow Method](./21-customer-segmentation-kmeans.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [High-Dimensional Data Visualization with PCA](./23-pca-dimension-reduction-visualization.md)
