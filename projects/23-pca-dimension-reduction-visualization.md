# Project 23: High-Dimensional Data Visualization with PCA

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Dimensionality Reduction |
| **Algorithm** | Principal Component Analysis (PCA) |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Scikit-Learn Digits 64-Dimensional Image Dataset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Compress 64-dimensional pixel arrays into 2 principal components to visualize clustering and measure explained variance ratio.

---

## 2. Theoretical Foundations
PCA finds orthogonal axes (eigenvectors of the covariance matrix $\mathbf{\Sigma}$) along which data variance is maximized. Projecting data onto the top $k$ principal components preserves the maximum information while discarding redundant collinear dimensions.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Principal Component Analysis (PCA)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

digits = load_digits()
X = digits.data # 64 features per digit (8x8 pixel grid)
y = digits.target

scaler = StandardScaler()
X_s = scaler.fit_transform(X)

# 1. Full PCA to inspect scree variance ratio
pca_full = PCA()
pca_full.fit(X_s)
cum_var = np.cumsum(pca_full.explained_variance_ratio_)

n_95 = np.argmax(cum_var >= 0.95) + 1
print(f"Original Dimensions: {X.shape[1]}")
print(f"Dimensions required for 95% variance: {n_95}")

# 2. 2D Projection for Visual Comprehension
pca_2d = PCA(n_components=2)
X_2d = pca_2d.fit_transform(X_s)

print(f"\n2D Explained Variance: {pca_2d.explained_variance_ratio_.sum() * 100:.2f}%")
print(f"Component 1 Variance: {pca_2d.explained_variance_ratio_[0]*100:.2f}%")
print(f"Component 2 Variance: {pca_2d.explained_variance_ratio_[1]*100:.2f}%")

df_pca = pd.DataFrame(X_2d, columns=['PC1', 'PC2'])
df_pca['Digit'] = y
print("\nSample 2D Coordinates:")
print(df_pca.head())
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: First 2 PCs capture ~22% of total 64-dim variance, sufficient to separate distinct digits.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Plot the 2D scatter colored by digit label using Matplotlib.
- [ ] Compare PCA with t-SNE (TSNE) and UMAP for non-linear manifold projection.

---

## Navigation
- **Previous Project**: [Hierarchical Consumer Profiling with Agglomerative Clustering](./22-mall-customer-hierarchical-clustering.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Spatial Density Clustering of GPS Coordinates with DBSCAN](./24-urban-traffic-density-dbscan.md)
