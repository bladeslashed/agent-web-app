# Project 16: Telecom Customer Churn Prediction with Gradient Boosting

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | Gradient Boosting Classifier |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Telecom Subscriber Usage & Churn Records |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Identify subscribers likely to cancel subscription contracts based on billing tenure, monthly fees, contract type, and service tickets.

---

## 2. Theoretical Foundations
Gradient Boosting for binary classification minimizes log loss by fitting regression trees to the pseudo-residuals of predicted probabilities:
$$p_i = \frac{1}{1 + e^{-F_{m-1}(x_i)}}$$
The trees sequentially optimize the decision boundary, successfully isolating complex interactions between tenure and billing disputes.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Gradient Boosting Classifier` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

np.random.seed(42)
n = 1000
tenure_months = np.random.exponential(24, n)
monthly_charges = np.random.uniform(20, 110, n)
has_fiber = np.random.choice([0, 1], n, p=[0.4, 0.6])
support_tickets = np.random.poisson(1.2, n)
contract_annual = np.random.choice([0, 1], n, p=[0.55, 0.45])

churn_score = -1.0 - (tenure_months * 0.05) + (monthly_charges * 0.02) + (support_tickets * 0.6) - (contract_annual * 1.5)
prob_churn = 1 / (1 + np.exp(-churn_score))
churned = (np.random.rand(n) < prob_churn).astype(int)

X = pd.DataFrame({'Tenure': tenure_months, 'MonthlyFee': monthly_charges, 'FiberOptic': has_fiber, 'SupportTickets': support_tickets, 'AnnualContract': contract_annual})
y = churned

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

gbc = GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=3, random_state=42)
gbc.fit(X_train, y_train)

y_pred = gbc.predict(X_test)
y_prob = gbc.predict_proba(X_test)[:, 1]

print("Classification Report:\n", classification_report(y_test, y_pred))
print(f"ROC-AUC Score: {roc_auc_score(y_test, y_prob):.4f}")
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: ROC-AUC ≈ 0.83 - 0.87, Accuracy ≈ 78% - 83%.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Adjust classification threshold from 0.5 to maximize recall for high-value churners.
- [ ] Compare GradientBoosting with HistGradientBoostingClassifier.

---

## Navigation
- **Previous Project**: [Wine Quality Classification with K-Nearest Neighbors (KNN)](./15-wine-quality-grading.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Loan Credit Approval Scoring with Gaussian Naive Bayes](./17-loan-credit-approval.md)
