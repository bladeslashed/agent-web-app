# Project 41: Handwritten Digit Recognition with Multi-Layer Perceptron (MLP)

| Attribute | Specification |
|---|---|
| **Category** | Computer Vision & Neural Networks |
| **Algorithm** | Multi-Layer Perceptron (MLPClassifier) with Adam Optimizer |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Scikit-Learn Digits 8x8 Pixel Dataset |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Recognize handwritten numerical digits (0-9) using a fully-connected feedforward neural network with backpropagation.

---

## 2. Theoretical Foundations
A Multi-Layer Perceptron (MLP) consists of input, hidden, and output layers. Hidden layers apply non-linear activations (ReLU: $f(z) = \max(0, z)$), and the output layer produces normalized class probabilities via Softmax:
$$P(y=k|x) = \frac{e^{z_k}}{\sum_j e^{z_j}}$$
Weights are optimized through backpropagation using the Adam optimizer to minimize Cross-Entropy loss.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Multi-Layer Perceptron (MLPClassifier) with Adam Optimizer` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.datasets import load_digits
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

digits = load_digits()
X = digits.data # 1797 samples, 64 features (8x8 grayscale pixels)
y = digits.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# 2 hidden layers: 64 -> 32 neurons
mlp = MLPClassifier(hidden_layer_sizes=(64, 32), activation='relu', solver='adam', max_iter=200, random_state=42)
mlp.fit(X_train_s, y_train)

y_pred = mlp.predict(X_test_s)
print(f"Digit Recognition Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%\n")
print("Classification Report:\n", classification_report(y_test, y_pred))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Test accuracy > 96% with balanced precision and recall across all digits 0-9.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Plot the training loss curve using mlp.loss_curve_.
- [ ] Visualize misclassified images to inspect edge cases.

---

## Navigation
- **Previous Project**: [FAQ Query Intent Matcher with Cosine Similarity](./40-faq-intent-matching-engine.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Fashion Apparel Item Classification with Neural Networks](./42-fashion-mnist-clothing-classifier.md)
