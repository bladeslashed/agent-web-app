# Project 13: Breast Cancer Malignancy Detection with Support Vector Machines

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | Support Vector Classifier (SVC - Linear & RBF) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Scikit-Learn Breast Cancer Wisconsin Diagnostic Dataset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Classify digitized cell nucleus biopsy features as benign or malignant with maximum-margin separation.

---

## 2. Theoretical Foundations
Support Vector Machines find the hyperplane that maximizes the geometric margin $2 / ||w||$ between the two classes. Support vectors are the data points lying closest to the decision boundary that dictate its orientation.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Support Vector Classifier (SVC - Linear & RBF)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

data = load_breast_cancer(as_frame=True)
X = data.data
y = data.target # 0: Malignant, 1: Benign

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

svm = SVC(kernel='rbf', C=1.0, probability=True, random_state=42)
svm.fit(X_train_s, y_train)

y_pred = svm.predict(X_test_s)
y_prob = svm.predict_proba(X_test_s)[:, 1]

print("Classification Report:\n", classification_report(y_test, y_pred, target_names=data.target_names))
print(f"ROC-AUC Score: {roc_auc_score(y_test, y_prob):.4f}")
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Accuracy > 96%, ROC-AUC > 0.99, Recall for malignant > 95%.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Tune C and gamma hyperparameters using GridSearchCV.
- [ ] Compare LinearSVC against RBF kernel performance.

---

## Navigation
- **Previous Project**: [Titanic Survival Prediction with Logistic Regression](./12-titanic-survival-prediction.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Cardiovascular Disease Risk Prediction with Random Forest](./14-heart-disease-risk-prediction.md)
