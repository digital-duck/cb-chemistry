# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 257 in / 601 out
- **Latency:** 15459ms
- **Timestamp:** 2026-09-13 17:11:13

## Output

```output


---

## Measurement

**Definition.** A *measurement* is a mapping $m: Q \to \mathbb{R} \times U$ that assigns to a physical quantity $Q$ a numerical value $x \in \mathbb{R}$ together with a unit $u \in U$, such that the pair $(x, u)$ represents $Q$ relative to a chosen reference standard. Formally, if $Q$ belongs to a one-dimensional quantity space with reference unit $u_0$, then $m(Q) = (x, u_0)$ where $x = Q / u_0$, the ratio of $Q$ to the magnitude of $u_0$. Every measurement carries an associated *uncertainty* $\delta x \geq 0$, so the complete report is the triple $(x, \delta x, u)$.

**Worked example.** Suppose a rod has true length $L$, and a ruler graduated in millimeters yields a reading $x = 152.3\,\text{mm}$ with instrument resolution $\delta x = 0.1\,\text{mm}$. The measurement is reported as $L = (152.3 \pm 0.1)\,\text{mm}$, meaning $L \in [152.2, 152.4]\,\text{mm}$ under the assumption of uniform reading error. Converting to centimeters, since $1\,\text{cm} = 10\,\text{mm}$, gives $L = (15.23 \pm 0.01)\,\text{cm}$, illustrating that the ratio $x/\delta x$ (the relative precision) is invariant under a change of unit, while $x$ and $\delta x$ individually rescale.

**Key theorem (propagation of uncertainty).** If $f = f(x_1, \dots, x_n)$ is a differentiable function of independently measured quantities $x_i$ each with uncertainty $\delta x_i$, then to first order
$$
(\delta f)^2 = \sum_{i=1}^n \left(\frac{\partial f}{\partial x_i}\right)^2 (\delta x_i)^2.
$$
This follows from a first-order Taylor expansion of $f$ about the measured values, combined with the assumption of uncorrelated errors.

**Lab cell (SymPy).**
```python
import sympy as sp

x, y, dx, dy = sp.symbols('x y dx dy', positive=True)
f = x * y  # example: area from length and width
df = sp.sqrt(sum((sp.diff(f, var) * d)**2 for var, d in [(x, dx), (y, dy)]))
sp.pprint(df)
```

---

## Precision

**Definition.** Precision refers to the degree of reproducibility or agreement among repeated measurements of the same quantity under unchanged conditions. Formally, if $x_1, x_2, \ldots, x_n$ are independent measurements of a fixed quantity, precision is inversely related to the dispersion of these values, commonly quantified by the sample standard deviation
$$
s = \sqrt{\frac{1}{n-1} \sum_{i=1}^{n} (x_i - \bar{x})^2}, \qquad \bar{x} = \frac{1}{n}\sum_{i=1}^n x_i.
$$
A small $s$ indicates high precision; a large $s$ indicates low precision. Precision concerns the *spread* of measurements around their own mean and is distinct from accuracy, which concerns the closeness of that mean to the true value $\mu$.

**Worked example.** Suppose a student measures the period of a pendulum five times, obtaining $T = 2.01, 2.03, 1.99, 2.02, 2.00$ seconds. The mean is $\bar{T} = 2.010$ s. Computing the sample standard deviation yields $s \approx 0.0158$ s. Since the values cluster tightly around $\bar{T}$, the measurements are precise, regardless of whether $\bar{T}$ equals the pendulum's true period.

**Key theorem.** *Bias–variance decomposition of mean squared error.* For an estimator $\hat{\theta}$ of a parameter $\theta$,
$$
\mathbb{E}\big[(\hat{\theta} - \theta)^2\big] = \underbrace{\big(\mathbb{E}[\hat{\theta}] - \theta\big)^2}_{\text{bias}^2 \,(\text{accuracy})} + \underbrace{\operatorname{Var}(\hat{\theta})}_{\text{precision}}.
$$
This identity formalizes the separation between accuracy (bias) and precision (variance): total measurement error decomposes exactly into these two independent contributions, and eliminating one does not guarantee eliminating the other.

**Lab cell (SymPy).**
```python
import sympy as sp

data = [2.01, 2.03, 1.99, 2.02, 2.00]
n = len(data)
mean = sp.Rational(sum(data), n).evalf()

variance = sum((sp.Rational(x) - mean)**2 for x in data) / (n - 1)
std_dev = sp.sqrt(variance)

print(f"Mean: {mean}")
print(f"Sample standard deviation (precision measure): {std_dev.evalf()}")
```

---

## Payoff

Precision is the capstone of this book because it is the concept that makes every other idea *usable*. A definition, a theorem, an algorithm — none of these have practical force until we can state, with a guaranteed bound, how close our computed answer lies to the true one. Formally, we say a numerical procedure achieves precision $\varepsilon > 0$ if, for an exact quantity $x$ and its approximation $\hat{x}$, we can certify
$$
|x - \hat{x}| \le \varepsilon.
$$
This is stronger than mere accuracy in a single trial: precision is a *controllable* bound, derivable from the structure of the method itself (truncation order, condition number, floating-point unit roundoff) rather than from luck.

**Worked example.** Consider approximating $e$ by the truncated series $\hat{e}_n = \sum_{k=0}^n 1/k!$. The Lagrange remainder gives
$$
|e - \hat{e}_n| \le \frac{e}{(n+1)!} \le \frac{3}{(n+1)!}.
$$
For $n = 10$, this bound is under $10^{-7}$: we have not merely computed a number close to $e$, we have *proven* how close.

**Key theorem.** This is the content of the *a priori* error bound: for a broad class of approximation schemes (Taylor truncation, quadrature, iterative root-finding), the error is controlled by a computable function of the method's order and the problem's smoothness, independent of empirical testing.

```python
from sympy import symbols, exp, series, N

n = 10
approx = sum(1/N(k, 30).factorial() if False else 1 for k in [])  # placeholder avoided
x = symbols('x')
taylor = series(exp(x), x, 0, n+1).removeO()
print(taylor.subs(x, 1).evalf(30) - exp(1).evalf(30))
```

Every domain this book has touched depends on precision to become an *engineering* tool rather than a curiosity: numerical simulation needs error bars before a bridge is trusted; cryptography needs precise arithmetic over finite fields before a key exchange is secure; machine learning needs quantified rounding error before quantized weights are deployed; scientific measurement needs propagated uncertainty before a result is publishable. In each case, the same inequality — a bound you can prove, not merely observe — is what turns computation into knowledge.

We invite you to choose one of these applications and trace precision through it: pick error propagation in numerical simulation, and ask how the bound in this chapter scales when a hundred approximate operations are chained together.
```
