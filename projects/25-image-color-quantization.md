# Project 25: Image Color Palette Quantization with K-Means

| Attribute | Specification |
|---|---|
| **Category** | Unsupervised Learning - Clustering |
| **Algorithm** | K-Means Clustering on Pixel RGB Color Vectors |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Synthetic High-Color Photographic Image |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Compress thousands of continuous RGB colors down to an indexed palette of 8 or 16 colors for lossy image compression.

---

## 2. Theoretical Foundations
Color quantization treats every pixel as a 3D point in RGB space $[R, G, B]$. Fitting K-Means clusters millions of unique colors into $K$ representative centroid colors, replacing each pixel with its closest centroid index to reduce memory footprint.

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `K-Means Clustering on Pixel RGB Color Vectors` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
from sklearn.cluster import KMeans

# 1. Synthesize an image: 100x100 pixels with 3 color channels (RGB)
np.random.seed(42)
w, h = 100, 100
# Gradient + textures
x_coord, y_coord = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
r = (np.sin(x_coord * 6) * 0.5 + 0.5)
g = (np.cos(y_coord * 6) * 0.5 + 0.5)
b = ((x_coord + y_coord) / 2)
img = np.dstack([r, g, b])

# Reshape into (N, 3) pixel array
pixels = img.reshape(-1, 3)
n_unique_before = len(np.unique(np.round(pixels, 3), axis=0))
print(f"Original Unique Colors: ~{n_unique_before}")

# 2. Cluster to 8 representative colors
n_colors = 8
kmeans = KMeans(n_clusters=n_colors, n_init=5, random_state=42)
labels = kmeans.fit_predict(pixels)
palette = kmeans.cluster_centers_

# 3. Reconstruct Quantized Image
compressed_pixels = palette[labels]
compressed_img = compressed_pixels.reshape(h, w, 3)

# Compression ratio estimate
uncompressed_bits = w * h * 24 # 24 bits per pixel
# Palette (8 * 24 bits) + index (3 bits per pixel)
compressed_bits = (n_colors * 24) + (w * h * 3)
ratio = uncompressed_bits / compressed_bits

print(f"Compressed Palette: {n_colors} Centroid Colors")
print(f"Memory Reduction: ~{ratio:.2f}x compression factor")
print(f"Reconstruction MSE: {np.mean((pixels - compressed_pixels)**2):.5f}")
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: Compression ratio ≈ 7x-8x with minimal visual MSE reconstruction error.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Load a real JPEG image using matplotlib.image.imread and save the quantized output.
- [ ] Compare K=4, 8, 16, and 32 color fidelity.

---

## Navigation
- **Previous Project**: [Spatial Density Clustering of GPS Coordinates with DBSCAN](./24-urban-traffic-density-dbscan.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: [Unsupervised Banking Fraud Spotting with Isolation Forest](./26-banking-outlier-detection-isolation-forest.md)
