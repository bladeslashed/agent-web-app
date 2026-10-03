# Project 19: Diabetes Diagnostic Model with GridSearchCV Tuning

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | Logistic Regression with GridSearchCV |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Pima Indians Diabetes Diagnostic Biomarkers |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Predict clinical diabetes onset within a 5-year window and tune regularization strength C and penalty norms using cross-validated grid search.

---

## 2. Theoretical Foundations
Hyperparameter tuning systematically searches parameter space $\Theta$. Cross-Validation (K-Fold) evaluates each candidate tuple $(\lambda, C)$ on held-out folds, selecting the configuration that maximizes generalization metric (e.g. ROC-AUC) without test data leakage.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Logistic Regression with GridSearchCV` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score

np.random.seed(42)
n = 768
pregnancies = np.random.poisson(3.8, n)
glucose = np.random.normal(120, 30, n)
bp = np.random.normal(69, 19, n)
bmi = np.random.normal(32, 7, n)
age = np.random.randint(21, 80, n)

diab_risk = -5.0 + (glucose * 0.035) + (bmi * 0.08) + (age * 0.03) + (pregnancies * 0.12)
prob_diab = 1 / (1 + np.exp(-diab_risk))
has_diab = (np.random.rand(n) < prob_diab).astype(int)

X = pd.DataFrame({'Pregnancies': pregnancies, 'Glucose': glucose, 'BP': bp, 'BMI': bmi, 'Age': age})
y = has_diab

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# Param grid
param_grid = {
    'C': [0.01, 0.1, 1.0, 10.0],
    'penalty': ['l2'],
    'solver': ['lbfgs']
}

grid = GridSearchCV(LogisticRegression(random_state=42), param_grid, cv=5, scoring='roc_auc')
grid.fit(X_train_s, y_train)

print(f"Optimal Parameters: {grid.best_params_}")
print(f"Best CV ROC-AUC: {grid.best_score_:.4f}")

best_model = grid.best_estimator_
y_pred = best_model.predict(X_test_s)
y_prob = best_model.predict_proba(X_test_s)[:, 1]

print("\nTest Set Performance:\n", classification_report(y_test, y_pred, target_names=['Negative', 'Diabetic']))
print(f"Test ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Test ROC-AUC ≈ 0.81 - 0.85, Best C usually 0.1 or 1.0.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Compare GridSearchCV against RandomizedSearchCV runtime for larger grids.
- [ ] Analyze odds-ratios by exponentiating logistic regression coefficients np.exp(coef_).

---

## Navigation
- **Previous Project**: [Imbalanced Credit Card Fraud Detection with Cost-Sensitive Modeling](./18-credit-card-fraud-detection.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Mushroom Edibility Identification with Rule-Based Decision Trees](./20-mushroom-edibility-classification.md)
