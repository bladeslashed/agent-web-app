# Project 18: Imbalanced Credit Card Fraud Detection with Cost-Sensitive Modeling

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | Balanced Random Forest & PR-AUC Evaluation |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Imbalanced Electronic Transaction Stream |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Detect rare fraudulent credit transactions (under 1% incidence) using class-weighted ensembles and Precision-Recall evaluation.

---

## 2. Theoretical Foundations
When dealing with extreme class imbalance ($99:1$), standard accuracy is deceptive (a dummy model predicting negative achieves 99% accuracy). Cost-sensitive weighting penalizes minority misclassification:
$$w_1 = \frac{N}{2 \times N_1}$$
Models are properly evaluated using the Area Under the Precision-Recall Curve (PR-AUC) rather than ROC-AUC.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Balanced Random Forest & PR-AUC Evaluation` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, average_precision_score, confusion_matrix

np.random.seed(42)
n = 5000
n_fraud = 50 # 1% fraud rate
n_legit = n - n_fraud

# Legit transactions
v1_legit = np.random.normal(0, 1, n_legit)
v2_legit = np.random.normal(0, 1, n_legit)
amt_legit = np.random.exponential(40, n_legit)

# Fraudulent transactions
v1_fraud = np.random.normal(3.5, 1.2, n_fraud)
v2_fraud = np.random.normal(-2.8, 1.2, n_fraud)
amt_fraud = np.random.exponential(250, n_fraud)

X = pd.DataFrame({
    'V1': np.concatenate([v1_legit, v1_fraud]),
    'V2': np.concatenate([v2_legit, v2_fraud]),
    'Amount': np.concatenate([amt_legit, amt_fraud])
})
y = np.concatenate([np.zeros(n_legit), np.ones(n_fraud)])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

# Balanced Random Forest automatically weights classes inversely proportional to frequency
clf = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
y_prob = clf.predict_proba(X_test)[:, 1]

print("Classification Report:\n", classification_report(y_test, y_pred, target_names=['Legit', 'Fraud']))
print(f"PR-AUC (Average Precision): {average_precision_score(y_test, y_prob):.4f}")
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: PR-AUC > 0.85, Fraud Recall > 80% without excessive false alarms.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Implement synthetic minority oversampling (SMOTE) using imbalanced-learn.
- [ ] Plot Precision-Recall curve with PrecisionRecallDisplay.

---

## Navigation
- **Previous Project**: [Loan Credit Approval Scoring with Gaussian Naive Bayes](./17-loan-credit-approval.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Diabetes Diagnostic Model with GridSearchCV Tuning](./19-diabetes-onset-classification.md)
