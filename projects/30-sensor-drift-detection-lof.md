# Project 30: Industrial Sensor Drift Anomaly Detection with Local Outlier Factor

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Anomaly Detection |
| **Algorithm** | Local Outlier Factor (LOF) |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Manufacturing Turbine Temperature & Vibration Telemetry |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Detect gradual calibration degradation and mechanical sensor drift by comparing local sample density against neighboring clusters.

---

## 2. Theoretical Foundations
Local Outlier Factor measures the local density deviation of a point with respect to its neighbors. If a point has a significantly lower density than its neighbors (LOF > 1.5), it is located in a sparser region, signifying drift or sensor failure.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Local Outlier Factor (LOF)` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler

np.random.seed(42)
n_normal = 400
# Baseline normal engine vibration and temperature
vibe = np.random.normal(2.5, 0.4, n_normal)
temp = 65 + (vibe * 4.0) + np.random.normal(0, 1.5, n_normal)

# Introduce 20 drifted / failing sensor readings
n_drift = 20
drift_vibe = np.random.uniform(4.5, 7.0, n_drift)
drift_temp = np.random.uniform(85, 110, n_drift)

X = pd.DataFrame({
    'Vibration_mm_s': np.concatenate([vibe, drift_vibe]),
    'Temperature_C': np.concatenate([temp, drift_temp])
})

scaler = StandardScaler()
X_s = scaler.fit_transform(X)

# LOF with 20 nearest neighbors
lof = LocalOutlierFactor(n_neighbors=20, contamination=0.05)
y_pred = lof.fit_predict(X_s) # 1: Inlier, -1: Outlier
negative_outlier_factor = lof.negative_outlier_factor_

X['LOF_Score'] = -negative_outlier_factor
X['Prediction'] = y_pred

detected = (y_pred == -1).sum()
actual_drift_detected = (y_pred[-n_drift:] == -1).sum()

print(f"Total Outliers Flagged: {detected}")
print(f"Actual Sensor Drifts Detected: {actual_drift_detected} / {n_drift} ({actual_drift_detected/n_drift*100:.1f}%)")
print("\nTop 5 Most Abnormal Readings:\n", X.sort_values(by='LOF_Score', ascending=False).head())
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Detects 100% of drift conditions with LOF scores > 2.0.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Use LOF with novelty=True for streaming inference on new observations.
- [ ] Compare LOF with Mahalanobis distance.

---

## Navigation
- **Previous Project**: [Text Topic Discovery with Latent Dirichlet Allocation (LDA)](./29-document-topic-modeling-lda.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [SMS Spam Filter with TF-IDF and Multinomial Naive Bayes](./31-sms-spam-ham-classifier.md)
