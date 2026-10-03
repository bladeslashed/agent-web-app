# Project 24: Spatial Density Clustering of GPS Coordinates with DBSCAN

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Clustering |
| **Algorithm** | DBSCAN (Density-Based Spatial Clustering of Applications with Noise) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Urban Taxi Pickup Coordinates & Hotspots |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Discover arbitrary-shaped traffic congregation zones and filter out isolated outlier points without specifying cluster count.

---

## 2. Theoretical Foundations
DBSCAN groups points that have at least `min_samples` neighbors within radius $\epsilon$. Points that are density-reachable form dense clusters of arbitrary topology, while points in low-density regions are identified as noise (label -1).

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `DBSCAN (Density-Based Spatial Clustering of Applications with Noise)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

# 1. Synthesize 3 Dense City Hotspots + Scattered Outliers
np.random.seed(42)
hotspot1 = np.random.normal([40.75, -73.98], [0.005, 0.005], (200, 2)) # Times Square
hotspot2 = np.random.normal([40.71, -74.00], [0.004, 0.004], (180, 2)) # Financial District
hotspot3 = np.random.normal([40.78, -73.96], [0.006, 0.006], (150, 2)) # Upper East Side
noise = np.random.uniform([40.68, -74.05], [40.82, -73.92], (50, 2))   # Outliers

coords = np.vstack([hotspot1, hotspot2, hotspot3, noise])
df = pd.DataFrame(coords, columns=['Latitude', 'Longitude'])

scaler = StandardScaler()
X = scaler.fit_transform(df)

# 2. Fit DBSCAN
db = DBSCAN(eps=0.25, min_samples=15)
df['Cluster'] = db.fit_predict(X)

n_clusters = len(set(df['Cluster'])) - (1 if -1 in df['Cluster'] else 0)
n_noise = list(df['Cluster']).count(-1)

print(f"Identified Dense Hotspot Clusters: {n_clusters}")
print(f"Filtered Noise / Outlier Points: {n_noise} ({n_noise / len(df) * 100:.1f}%)")

print("\nCluster Distribution:\n", df['Cluster'].value_counts())
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Discovers exactly 3 major hotspots and flags ~40-50 points as noise (-1).
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Use the Haversine metric with eps expressed in kilometers for true geographic coordinates.
- [ ] Determine optimal eps using k-distance nearest neighbor graph.

---

## Navigation
- **Previous Project**: [High-Dimensional Data Visualization with PCA](./23-pca-dimension-reduction-visualization.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Image Color Palette Quantization with K-Means](./25-image-color-quantization.md)
