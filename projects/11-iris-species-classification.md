# Project 11: Iris Flower Species Classification with Decision Trees

| Attribute | Specification |
|---|---|
| **Category** | Supervised Learning - Classification |
| **Algorithm** | Decision Tree Classifier |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Scikit-Learn Iris Benchmark Dataset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Classify Iris botanical specimens into three distinct species (Setosa, Versicolor, Virginica) using morphological dimensions.

---

## 2. Theoretical Foundations
Decision Tree Classifier splits data according to Gini Impurity:
$$I_G(p) = 1 - \sum_{k=1}^K p_k^2$$
Nodes choose splits that maximize information gain, creating an interpretable hierarchy of if-else threshold rules.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Decision Tree Classifier` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

iris = load_iris(as_frame=True)
X = iris.data
y = iris.target
target_names = iris.target_names

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%\n")
print("Classification Report:\n", classification_report(y_test, y_pred, target_names=target_names))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

print("\nDecision Tree Logic:\n", export_text(clf, feature_names=list(X.columns)))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Accuracy: 95% - 98%, with Setosa perfectly separable.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Plot the decision tree graph using plot_tree.
- [ ] Compare Gini Impurity vs Entropy split criteria.

---

## Navigation
- **Previous Project**: [Used Vehicle Valuation with Support Vector Regressor (SVR)](./10-used-car-valuation.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Titanic Survival Prediction with Logistic Regression](./12-titanic-survival-prediction.md)
