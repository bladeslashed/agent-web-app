# Project 27: Network Intrusion & Zero-Day Detection with One-Class SVM

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Anomaly Detection |
| **Algorithm** | One-Class Support Vector Machine (OneClassSVM) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Server TCP Packet & Telemetry Streams |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Train a boundary strictly on normal network traffic to detect unmodeled zero-day cyber attacks and intrusions.

---

## 2. Theoretical Foundations
One-Class SVM maps training points (known benign traffic) into feature space using an RBF kernel and finds the maximal margin hyperplane separating normal instances from the origin. Any novel test instance falling outside this boundary is flagged as a zero-day intrusion.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `One-Class Support Vector Machine (OneClassSVM)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

np.random.seed(42)
# Clean normal traffic: typical packet length, regular inter-arrival time
n_train = 1500
pkt_len = np.random.normal(512, 64, n_train)
inter_arrival_ms = np.random.exponential(50, n_train)
syn_ratio = np.random.uniform(0.01, 0.05, n_train)

X_train = pd.DataFrame({'PacketLen': pkt_len, 'InterArrival': inter_arrival_ms, 'SynRatio': syn_ratio})

# Test Set: 500 normal packets + 50 DDoS / port scan attack packets
n_test_norm = 500
n_attack = 50

norm_test = np.column_stack([np.random.normal(512, 64, n_test_norm), np.random.exponential(50, n_test_norm), np.random.uniform(0.01, 0.05, n_test_norm)])
attack_test = np.column_stack([np.random.normal(64, 5, n_attack), np.random.exponential(1.2, n_attack), np.random.uniform(0.70, 0.99, n_attack)])

X_test_raw = np.vstack([norm_test, attack_test])
y_test = np.array([1]*n_test_norm + [-1]*n_attack)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test_raw)

# Train One-Class SVM strictly on benign baseline
oc_svm = OneClassSVM(kernel='rbf', gamma='scale', nu=0.03)
oc_svm.fit(X_train_s)

y_pred = oc_svm.predict(X_test_s)
attacks_caught = ((y_pred == -1) & (y_test == -1)).sum()
false_alarms = ((y_pred == -1) & (y_test == 1)).sum()

print(f"Zero-Day Cyber Attacks Caught: {attacks_caught} / {n_attack} ({attacks_caught/n_attack*100:.1f}%)")
print(f"Benign False Alarms: {false_alarms} / {n_test_norm} ({false_alarms/n_test_norm*100:.1f}%)")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Attacks detected > 94% with low false alarm rate (< 5%).
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Analyze the impact of hyperparameter nu (fraction of outliers boundary tolerance).
- [ ] Evaluate EllipticEnvelope as an alternative for normally distributed features.

---

## Navigation
- **Previous Project**: [Unsupervised Banking Fraud Spotting with Isolation Forest](./26-banking-outlier-detection-isolation-forest.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Supermarket Basket Association Mining with Apriori Affinity](./28-market-basket-apriori-affinity.md)
