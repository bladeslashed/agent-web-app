# Project 26: Unsupervised Banking Fraud Spotting with Isolation Forest

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Anomaly Detection |
| **Algorithm** | Isolation Forest (iForest) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Banking Financial Ledger Transactions |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Isolate financial anomalies and fraudulent wire transfers based on the concept that anomalies are few and structurally different.

---

## 2. Theoretical Foundations
Isolation Forest isolates anomalies by randomly partitioning feature space. Because outliers are sparse and far from normal dense distributions, they require fewer random splits (shorter path lengths $h(x)$) to be isolated down to a tree leaf node:
$$s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$$

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Isolation Forest (iForest)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

np.random.seed(42)
n_regular = 2000
n_anomalies = 30

# Regular daily bank transactions: small transfer amounts, business hours
amt_reg = np.random.lognormal(3.5, 0.6, n_regular) # ~$20 - $150
hour_reg = np.random.normal(14, 3, n_regular) % 24
freq_reg = np.random.poisson(3, n_regular)

# Anomalies: massive wire transfers at 3 AM or 50 transfers in 1 hour
amt_anom = np.random.uniform(5000, 25000, n_anomalies)
hour_anom = np.random.choice([2, 3, 4], n_anomalies)
freq_anom = np.random.randint(25, 60, n_anomalies)

X = pd.DataFrame({
    'Amount': np.concatenate([amt_reg, amt_anom]),
    'HourOfDay': np.concatenate([hour_reg, hour_anom]),
    'HourlyTxCount': np.concatenate([freq_reg, freq_anom])
})
ground_truth = np.array([1]*n_regular + [-1]*n_anomalies)

# Unsupervised isolation: contamination estimate ~1.5%
iso = IsolationForest(contamination=0.015, random_state=42)
pred_labels = iso.fit_predict(X) # 1: normal, -1: anomaly
anomaly_scores = iso.decision_function(X)

X['IsAnomaly'] = pred_labels
X['Score'] = anomaly_scores

detected_anomalies = (pred_labels == -1).sum()
true_detected = ((pred_labels == -1) & (ground_truth == -1)).sum()

print(f"Total Flagged Anomalies: {detected_anomalies}")
print(f"Actual Fraud Caught (Precision): {true_detected} / {detected_anomalies} ({true_detected/detected_anomalies*100:.1f}%)")
print(f"Recall: {true_detected} / {n_anomalies} ({true_detected/n_anomalies*100:.1f}%)")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Recall > 85%, flagging outliers with minimal path lengths.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Plot anomaly score distributions for normal vs flagged points.
- [ ] Tune contamination hyperparameter using cross-validation on labeled validation sets.

---

## Navigation
- **Previous Project**: [Image Color Palette Quantization with K-Means](./25-image-color-quantization.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Network Intrusion & Zero-Day Detection with One-Class SVM](./27-network-intrusion-anomaly-one-class-svm.md)
