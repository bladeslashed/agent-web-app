# Project 20: Mushroom Edibility Identification with Rule-Based Decision Trees

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | Decision Tree Classifier with Rule Extraction |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Botanical Mushroom Morphological Attributes |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Identify poisonous vs edible mushrooms using categorical odor, gill color, and spore characteristics with zero false negative tolerance.

---

## 2. Theoretical Foundations
In critical classification tasks (such as poison detection), decision rules must be 100% human-auditable. A decision tree provides an explicit logical flowchart: e.g. IF Odor=Foul THEN Poisonous, avoiding black-box hazards.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Decision Tree Classifier with Rule Extraction` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import classification_report, confusion_matrix

np.random.seed(42)
n = 1000
odor = np.random.choice(['almond', 'anise', 'foul', 'none', 'pungent'], n)
gill_color = np.random.choice(['black', 'brown', 'buff', 'pink', 'white'], n)
cap_shape = np.random.choice(['bell', 'conical', 'flat', 'convex'], n)

# In real mushroom dataset, foul/pungent odor is almost 100% poisonous
is_poisonous = ((odor == 'foul') | (odor == 'pungent') | ((odor == 'none') & (gill_color == 'buff'))).astype(int)

df = pd.DataFrame({'Odor': odor, 'GillColor': gill_color, 'CapShape': cap_shape})
encoder = OneHotEncoder(sparse_output=False)
X = pd.DataFrame(encoder.fit_transform(df), columns=encoder.get_feature_names_out())
y = is_poisonous

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

dt = DecisionTreeClassifier(max_depth=4, random_state=42)
dt.fit(X_train, y_train)

y_pred = dt.predict(X_test)
print("Classification Report:\n", classification_report(y_test, y_pred, target_names=['Edible', 'Poisonous']))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

print("\nExact Extracted Safety Rules:\n", export_text(dt, feature_names=list(X.columns)))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Accuracy ≈ 99% - 100%, with 0 poisonous mushrooms classified as edible.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Adjust class weights to penalize false negatives (edible prediction for poisonous mushroom) by 100x.
- [ ] Compare OneHotEncoder against TargetEncoder.

---

## Navigation
- **Previous Project**: [Diabetes Diagnostic Model with GridSearchCV Tuning](./19-diabetes-onset-classification.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Customer Segmentation with K-Means & The Elbow Method](./21-customer-segmentation-kmeans.md)
