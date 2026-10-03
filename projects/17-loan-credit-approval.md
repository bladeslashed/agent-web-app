# Project 17: Loan Credit Approval Scoring with Gaussian Naive Bayes

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | Gaussian Naive Bayes (GaussianNB) |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Consumer Credit Bureau Applicant Records |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Score credit applicant default risk using probabilistic Bayes' Theorem under conditional feature independence assumptions.

---

## 2. Theoretical Foundations
Naive Bayes applies Bayes' Theorem with the naive assumption of conditional independence among predictors given the class:
$$P(C_k | x) \propto P(C_k) \prod_{i=1}^d P(x_i | C_k)$$
GaussianNB models continuous features using normal distributions: $P(x_i | C_k) \sim \mathcal{N}(\mu_{ik}, \sigma^2_{ik})$. It computes lightning-fast predictions even on vast datasets.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Gaussian Naive Bayes (GaussianNB)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

np.random.seed(42)
n = 800
income = np.random.lognormal(10.5, 0.5, n)
credit_score = np.clip(np.random.normal(680, 70, n), 300, 850)
debt_to_income = np.clip(np.random.normal(0.35, 0.12, n), 0.05, 0.8)
loan_amount = np.random.uniform(5000, 50000, n)

approval_score = (credit_score - 640) * 0.02 + (income / loan_amount) * 0.8 - (debt_to_income * 4.0)
approved = (approval_score > 0).astype(int)

X = pd.DataFrame({'Income': income, 'CreditScore': credit_score, 'DTI': debt_to_income, 'LoanAmount': loan_amount})
y = approved

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

gnb = GaussianNB()
gnb.fit(X_train, y_train)

y_pred = gnb.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%\n")
print(classification_report(y_test, y_pred, target_names=['Denied', 'Approved']))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Accuracy ≈ 86% - 91%, with strong probabilistic separation.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Inspect empirical feature means and variances learned by gnb.theta_ and gnb.var_.
- [ ] Compare GaussianNB against ComplementNB.

---

## Navigation
- **Previous Project**: [Telecom Customer Churn Prediction with Gradient Boosting](./16-customer-churn-prediction.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Imbalanced Credit Card Fraud Detection with Cost-Sensitive Modeling](./18-credit-card-fraud-detection.md)
