# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 257 in / 556 out
- **Latency:** 12025ms
- **Timestamp:** 2026-09-13 17:23:31

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

Precision is the concept that makes error legible. Where accuracy asks whether a result is correct, precision asks how much confidence that correctness deserves — a quantity, not a verdict. Formally, if $\hat{x}$ estimates a true value $x$, precision is expressed through an error bound $|\hat{x} - x| < \varepsilon$, or through the number of significant digits and decimal places carried consistently through a computation. Precision is the natural endpoint of this book because every prior concept — representation, approximation, convergence, stability — exists to answer one question: *how much can I trust this number?* Precision is the language in which that trust is finally stated.

**Worked example.** Consider $\pi$ approximated by the Leibniz series $\pi \approx 4\sum_{k=0}^{n} \frac{(-1)^k}{2k+1}$. At $n=1000$, the partial sum agrees with $\pi$ to only about three decimal digits, despite a thousand terms — a lesson in precision that mere iteration cannot substitute for.

**Key theorem.** *Precision–complexity tradeoff*: for a convergent numerical method with order $p$, the number of correct digits grows linearly with the number of bits of working precision, but often only sublinearly with computational effort, unless the algorithm's convergence order is improved. This theorem is why Newton's method ($p=2$) outperforms bisection ($p=1$) for the same effort.

**Lab cell.**
```python
from sympy import pi, Rational, N
from sympy.core.evalf import N as evalf
partial = sum(Rational((-1)**k, 2*k+1) for k in range(1000))
print(N(4*partial, 10), N(pi, 10))
```

Precision connects directly to numerical error analysis (bounding $\varepsilon$ in scientific computation), to cryptography (where precision in modular arithmetic determines security margins), to physical measurement (propagating instrument uncertainty through derived quantities), and to machine learning (quantifying floating-point precision loss in large-scale training). In every domain, precision converts a raw number into a trustworthy claim.

Choose one of these applications and trace precision through it from first principles — you will find the same inequality, $|\hat{x}-x|<\varepsilon$, governing the entire discipline.
```
