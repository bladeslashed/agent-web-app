# Project 35: Natural Language Identification with Character n-grams

| Attribute | Specification |
|---|---|
| **Category** | Natural Language Processing (NLP) |
| **Algorithm** | Multinomial Naive Bayes on Subword Character n-grams |
| **Difficulty** | Beginner |
| **Recommended Dataset** | Multi-Lingual Parallel Sentence Corpus (English, Spanish, French, German) |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Identify the natural language of brief text snippets using character n-gram frequencies rather than word vocabularies.

---

## 2. Theoretical Foundations
Individual words vary widely across domains, but character sequences (e.g. German 'sch', Spanish 'ción', French 'eau', English 'the') are invariant linguistic signatures. Character-level n-grams ($n=2, 3$) robustly identify languages even on short, typo-ridden phrases.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Multinomial Naive Bayes on Subword Character n-grams` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

corpus = [
    ("The quick brown fox jumps over the lazy dog in the park", "English"),
    ("Machine learning models can identify patterns from large datasets", "English"),
    ("El veloz zorro marrón salta sobre el perro perezoso en el parque", "Spanish"),
    ("Los modelos de aprendizaje automático pueden identificar patrones", "Spanish"),
    ("Le renard brun rapide saute par-dessus le chien paresseux dans le parc", "French"),
    ("Les modèles d'apprentissage automatique peuvent identifier des modèles", "French"),
    ("Der schnelle braune Fuchs springt über den faulen Hund im Park", "German"),
    ("Modelle für maschinelles Lernen können Muster aus großen Datensätzen erkennen", "German")
]

df = pd.DataFrame(corpus, columns=['Text', 'Language'])
X = df['Text']
y = df['Language']

# Character n-grams from length 2 to 4
pipeline = make_pipeline(
    TfidfVectorizer(analyzer='char', ngram_range=(2, 4)),
    MultinomialNB(alpha=0.1)
)
pipeline.fit(X, y)

# Test on novel multilingual phrases
test_snippets = [
    "Hello my friend, how are you doing today?",
    "Hola amigo, ¿cómo estás hoy?",
    "Bonjour mon ami, comment allez-vous aujourd'hui?",
    "Guten Tag mein Freund, wie geht es dir heute?"
]

preds = pipeline.predict(test_snippets)
probs = pipeline.predict_proba(test_snippets)
classes = pipeline.classes_

print("Language Detection Results:")
for text, pred, prob in zip(test_snippets, preds, probs):
    conf = np.max(prob) * 100
    print(f"[{pred:7s} | {conf:5.1f}% conf] "{text}"")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: 100% correct identification with high confidence scores across all 4 languages.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Expand to 10+ languages including non-Latin scripts (Cyrillic, Greek, Arabic).
- [ ] Evaluate on short Twitter-style snippets (< 20 characters).

---

## Navigation
- **Previous Project**: [Online Misinformation & Fake News Detector](./34-fake-news-detector.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Resume & Job Description Matcher with Cosine Similarity](./36-resume-job-description-matcher.md)
