# Project 14: Cardiovascular Disease Risk Prediction with Random Forest

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | Random Forest Classifier |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Cardiovascular Clinical Vitals Dataset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Assess patient cardiac risk based on blood pressure, cholesterol, resting ECG, max heart rate, and chest pain.

---

## 2. Theoretical Foundations
Random Forest Classifier aggregates predictions from hundreds of decision trees via majority voting. By bagging samples and randomly selecting subset features at each candidate split, it minimizes ensemble variance and handles correlated clinical biomarkers.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Random Forest Classifier` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix

np.random.seed(42)
n = 600
age = np.random.randint(35, 75, n)
cholesterol = np.random.normal(240, 45, n)
resting_bp = np.random.normal(132, 18, n)
max_hr = 220 - age + np.random.normal(0, 15, n)
chest_pain_type = np.random.choice([0, 1, 2, 3], n)

# Cardiac risk score
risk_score = (age * 0.04) + (cholesterol * 0.015) + (resting_bp * 0.025) - (max_hr * 0.03) + (chest_pain_type * 0.8)
prob_disease = 1 / (1 + np.exp(-risk_score + 4.0))
has_disease = (np.random.rand(n) < prob_disease).astype(int)

X = pd.DataFrame({'Age': age, 'Cholesterol': cholesterol, 'RestingBP': resting_bp, 'MaxHR': max_hr, 'ChestPain': chest_pain_type})
y = has_disease

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

rf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
rf.fit(X_train, y_train)

y_pred = rf.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(f"F1-Score: {f1_score(y_test, y_pred):.4f}")
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

importances = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)
print("\nClinical Biomarker Importances:\n", importances)
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Accuracy ≈ 84% - 88%, F1-Score ≈ 0.82 - 0.86.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Calibrate model prediction probabilities using CalibratedClassifierCV.
- [ ] Analyze SHAP values to explain individual patient risk factor attribution.

---

## Navigation
- **Previous Project**: [Breast Cancer Malignancy Detection with Support Vector Machines](./13-breast-cancer-diagnosis.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Wine Quality Classification with K-Nearest Neighbors (KNN)](./15-wine-quality-grading.md)
