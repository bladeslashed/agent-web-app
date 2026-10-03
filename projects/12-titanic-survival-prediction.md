# Project 12: Titanic Survival Prediction with Logistic Regression

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | Logistic Regression with Feature Engineering |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Titanic Passenger Manifest Attributes |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Predict passenger survival odds from demographic, ticket class, fare, and cabin attributes using sigmoid classification.

---

## 2. Theoretical Foundations
Logistic Regression maps a linear combination of features to a probability between 0 and 1 using the Sigmoid (logistic) function:
$$P(Y=1|X) = \sigma(w^T X) = \frac{1}{1 + e^{-w^T X}}$$
Parameters are learned by maximizing Bernoulli log-likelihood via Cross-Entropy loss.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Logistic Regression with Feature Engineering` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, roc_auc_score, confusion_matrix

np.random.seed(42)
n = 800
pclass = np.random.choice([1, 2, 3], n, p=[0.25, 0.25, 0.50])
is_female = np.random.choice([0, 1], n, p=[0.65, 0.35])
age = np.clip(np.random.normal(30, 14, n), 1, 80)
fare = (4 - pclass) * 35 + np.random.exponential(15, n)
sibsp = np.random.choice([0, 1, 2], n, p=[0.7, 0.2, 0.1])

# Survival probability strongly influenced by gender and passenger class
log_odds = -1.2 + (is_female * 2.6) - (pclass * 0.8) - (age * 0.02) + (fare * 0.01)
prob_survival = 1 / (1 + np.exp(-log_odds))
survived = (np.random.rand(n) < prob_survival).astype(int)

X = pd.DataFrame({'Pclass': pclass, 'IsFemale': is_female, 'Age': age, 'Fare': fare, 'SibSp': sibsp})
y = survived

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

log_reg = LogisticRegression(random_state=42)
log_reg.fit(X_train_s, y_train)

y_pred = log_reg.predict(X_test_s)
y_prob = log_reg.predict_proba(X_test_s)[:, 1]

print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Accuracy ≈ 80% - 84%, ROC-AUC ≈ 0.85 - 0.88.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Engineer interaction terms such as family size and age class categories.
- [ ] Plot the ROC curve with RocCurveDisplay.

---

## Navigation
- **Previous Project**: [Iris Flower Species Classification with Decision Trees](./11-iris-species-classification.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Breast Cancer Malignancy Detection with Support Vector Machines](./13-breast-cancer-diagnosis.md)
