# Project 45: Road Traffic Sign Recognition with Color Moments & KNN

| Attribute | Specification |
|---|---|
| **Category** | Computer Vision & Classification |
| **Algorithm** | K-Nearest Neighbors (KNN) & Color Distribution Moments |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Simulated Road Signs (Stop, Yield, Speed Limit) |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Classify critical road signs based on dominant color channel moments (mean, standard deviation, skewness) and geometry.

---

## 2. Theoretical Foundations
Color moments capture color distributions in an image: mean (overall brightness/color intensity) and variance (contrast). Because Stop signs are predominantly high-red and Yield signs high-yellow, color moments provide computationally lightweight descriptors for embedded automotive systems.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `K-Nearest Neighbors (KNN) & Color Distribution Moments` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score

np.random.seed(42)
n_per = 120

# Stop: High Red, low Green, Octagon
stop = np.column_stack([np.random.normal(0.85, 0.05, n_per), np.random.normal(0.15, 0.04, n_per), np.random.normal(8.0, 0.2, n_per)])
# Yield: High Red + High Green (Yellow), Triangle (3 sides)
yield_sign = np.column_stack([np.random.normal(0.78, 0.06, n_per), np.random.normal(0.75, 0.05, n_per), np.random.normal(3.0, 0.1, n_per)])
# Speed Limit: High White/Grayscale (balanced R and G), Rectangle (4 sides)
speed_limit = np.column_stack([np.random.normal(0.50, 0.06, n_per), np.random.normal(0.50, 0.06, n_per), np.random.normal(4.0, 0.1, n_per)])

X = np.vstack([stop, yield_sign, speed_limit])
y = np.array([0]*n_per + [1]*n_per + [2]*n_per)
class_names = ['Stop Sign', 'Yield Sign', 'Speed Limit']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train_s, y_train)

y_pred = knn.predict(X_test_s)
print(f"Traffic Sign Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%\n")
print(classification_report(y_test, y_pred, target_names=class_names))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Accuracy > 98% with unambiguous separation across the signs.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Test classification robustness against artificial Gaussian image noise and brightness shifts.
- [ ] Compare with a Convolutional Neural Network on the GTSRB dataset.

---

## Navigation
- **Previous Project**: [Facial Feature Recognition with HOG & Linear Classifiers](./44-face-detection-hog-classifier.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Movie Recommendation with Item-Based Collaborative Filtering](./46-movie-recommender-collaborative-filtering.md)
