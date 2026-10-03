# Project 15: Wine Quality Classification with K-Nearest Neighbors (KNN)

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | K-Nearest Neighbors Classifier (KNN) |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Scikit-Learn Wine Chemical Dataset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Classify wine cultivars based on 13 chemical constituents (alcohol, malic acid, flavonoids, color intensity) using metric space proximity.

---

## 2. Theoretical Foundations
KNN is a non-parametric instance-based lazy learner. Given query point $x_0$, it identifies the $K$ closest training samples according to Euclidean distance:
$$d(x, x') = \sqrt{\sum_{i=1}^D (x_i - x'_i)^2}$$
and assigns the majority class label amongst its nearest neighbors.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `K-Nearest Neighbors Classifier (KNN)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.datasets import load_wine
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score

wine = load_wine(as_frame=True)
X = wine.data
y = wine.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# Find optimal K using 5-fold cross validation
k_scores = []
k_range = range(1, 15)
for k in k_range:
    knn = KNeighborsClassifier(n_neighbors=k)
    scores = cross_val_score(knn, X_train_s, y_train, cv=5)
    k_scores.append(scores.mean())

best_k = k_range[np.argmax(k_scores)]
print(f"Optimal K selected: {best_k} (CV Accuracy: {max(k_scores)*100:.2f}%)")

best_knn = KNeighborsClassifier(n_neighbors=best_k)
best_knn.fit(X_train_s, y_train)

y_pred = best_knn.predict(X_test_s)
print(f"Test Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%\n")
print(classification_report(y_test, y_pred, target_names=wine.target_names))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Test Accuracy > 95%, with optimal K typically between 3 and 7.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Experiment with distance-weighted voting (weights='distance').
- [ ] Evaluate Manhattan vs Euclidean metric distance formulations.

---

## Navigation
- **Previous Project**: [Cardiovascular Disease Risk Prediction with Random Forest](./14-heart-disease-risk-prediction.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Telecom Customer Churn Prediction with Gradient Boosting](./16-customer-churn-prediction.md)
