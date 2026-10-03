# Project 50: Multi-Armed Bandit Exploration with Epsilon-Greedy RL

| Attribute | Specification |
|---|---|
| **Category** | Reinforcement Learning |
| **Algorithm** | Epsilon-Greedy Multi-Armed Bandit |
| **Difficulty** | Intermediate |
| **Recommended Dataset** | Simulated Stochastic Slot Machines (Arms with True Win Rates) |
| **Prerequisites** | Python, NumPy, Pandas, Scikit-Learn |

---

## 1. Problem Statement & Objective
Solve the fundamental Exploration vs Exploitation dilemma in Reinforcement Learning using an Epsilon-Greedy multi-armed bandit agent.

---

## 2. Theoretical Foundations
The Multi-Armed Bandit problem represents sequential decision-making under uncertainty.
An agent balances:
- **Exploration**: Selecting random arms with probability $\epsilon$ to discover lucrative win rates.
- **Exploitation**: Selecting the best-known arm with probability $1 - \epsilon$:
$$A_t = \arg\max_a Q_t(a)$$
Value estimates update via incremental sample averages:
$$Q_{t+1}(A) = Q_t(A) + \frac{1}{N(A)} [R_t - Q_t(A)]$$

---

## 3. Step-by-Step Implementation Guide
1. **Data Ingestion & Synthesis**: Load or synthesize realistic domain observations with controllable noise and interaction terms.
2. **Train-Test Split**: Partition observations into training and evaluation sets (using stratification where appropriate).
3. **Feature Scaling / Vectorization**: Standardize continuous variables or vectorize text tokens to prevent feature dominance.
4. **Model Architecture & Training**: Instantiate `Epsilon-Greedy Multi-Armed Bandit` and fit model parameters.
5. **Evaluation & Diagnosis**: Quantify predictive power using established benchmark metrics.

---

## 4. Complete Runnable Python Code
The following script is fully self-contained and ready to execute immediately:

```python
import numpy as np
import pandas as pd

class MultiArmedBandit:
    def __init__(self, true_probabilities):
        self.probs = true_probabilities
        self.k = len(true_probabilities)

    def pull(self, arm):
        # Bernoulli reward: 1 with probability p, else 0
        return 1 if np.random.rand() < self.probs[arm] else 0

# True payoff probabilities (Arm 3 is optimal at 75%)
true_p = [0.25, 0.40, 0.55, 0.75, 0.35]
bandit = MultiArmedBandit(true_p)

# Simulation parameters
n_steps = 1000
epsilon = 0.10 # 10% exploration, 90% exploitation

# Agent state
k_arms = len(true_p)
Q = np.zeros(k_arms) # Estimated values
N = np.zeros(k_arms) # Pull counts
total_reward = 0
action_history = []

np.random.seed(42)
for t in range(n_steps):
    # Epsilon-greedy action selection
    if np.random.rand() < epsilon:
        action = np.random.choice(k_arms) # Explore
    else:
        action = np.argmax(Q) # Exploit

    reward = bandit.pull(action)
    N[action] += 1
    # Incremental update: Q = Q + (1/N) * (reward - Q)
    Q[action] += (1.0 / N[action]) * (reward - Q[action])
    
    total_reward += reward
    action_history.append(action)

optimal_arm = np.argmax(true_p)
optimal_pulls = action_history.count(optimal_arm)

print("Multi-Armed Bandit Results:")
print(f"Total Steps: {n_steps}")
print(f"Total Reward Collected: {total_reward} (Empirical Win Rate: {total_reward/n_steps*100:.1f}%)")
print(f"Optimal Arm (#{optimal_arm}) Selected: {optimal_pulls} / {n_steps} times ({optimal_pulls/n_steps*100:.1f}%)\n")

summary = pd.DataFrame({
    'Arm': range(k_arms),
    'True_Probability': true_p,
    'Estimated_Q': np.round(Q, 3),
    'Pull_Count': N.astype(int)
})
print(summary.to_string(index=False))
```

---

## 5. Expected Output & Performance Interpretation
- **Target Performance**: The agent pulls optimal Arm 3 > 80% of the time, converging to ~70% win rate.
- **Interpretation**: Verify that residuals or classification boundaries conform to theoretical expectations and that the model does not suffer from high bias (underfitting) or high variance (overfitting).

---

## 6. Next Steps & Extension Ideas
- [ ] Implement Upper Confidence Bound (UCB1) algorithm for uncertainty-directed exploration.
- [ ] Compare with Thompson Sampling using Beta-Bernoulli conjugate priors.

---

## Navigation
- **Previous Project**: [Retail Store Sales Forecasting with Rolling Statistics](./49-store-sales-forecasting-ridge.md)
- **Index**: [Back to 50 Projects Master Directory](./README.md)
- **Next Project**: None (Final Project)
