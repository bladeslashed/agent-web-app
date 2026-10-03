# Project 43: Rock-Paper-Scissors Gesture Recognition with SVM

| Attribute | Specification |
|---|---|
| **Category** | Computer Vision & Classification |
| **Algorithm** | Support Vector Classifier (SVC - RBF Kernel) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Hand Silhouette Geometric Properties |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Classify player hand gestures (Rock, Paper, Scissors) using geometric features (convexity, bounding ratio, perimeter) and SVM.

---

## 2. Theoretical Foundations
Hand silhouettes can be summarized by invariant morphological descriptors: aspect ratio, perimeter-to-area compactness ($P^2 / A$), and convexity. Non-linear SVM with RBF kernel separates the three gesture classes with clean decision boundaries.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Support Vector Classifier (SVC - RBF Kernel)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score

np.random.seed(42)
n_per = 150

# Rock: Compact fist, low perimeter/area, round aspect ratio
rock = np.column_stack([np.random.normal(1.0, 0.08, n_per), np.random.normal(14.0, 1.2, n_per), np.random.normal(0.92, 0.04, n_per)])
# Paper: Flat open hand, high area, high perimeter, large bounding box
paper = np.column_stack([np.random.normal(1.4, 0.12, n_per), np.random.normal(26.0, 2.0, n_per), np.random.normal(0.70, 0.05, n_per)])
# Scissors: Two extended fingers, medium area, very high aspect ratio
scissors = np.column_stack([np.random.normal(2.1, 0.20, n_per), np.random.normal(32.0, 2.5, n_per), np.random.normal(0.55, 0.06, n_per)])

X = np.vstack([rock, paper, scissors])
y = np.array([0]*n_per + [1]*n_per + [2]*n_per)
feature_names = ['AspectRatio', 'PerimeterToArea', 'Solidity']
class_names = ['Rock', 'Paper', 'Scissors']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

svm = SVC(kernel='rbf', C=5.0, random_state=42)
svm.fit(X_train_s, y_train)

y_pred = svm.predict(X_test_s)
print(f"Gesture Recognition Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%\n")
print(classification_report(y_test, y_pred, target_names=class_names))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Accuracy > 96% with clear separation of finger extensions.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Extract features directly from live webcam images using OpenCV.
- [ ] Map MediaPipe 21 hand landmarks to gesture classification.

---

## Navigation
- **Previous Project**: [Fashion Apparel Item Classification with Neural Networks](./42-fashion-mnist-clothing-classifier.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Facial Feature Recognition with HOG & Linear Classifiers](./44-face-detection-hog-classifier.md)
