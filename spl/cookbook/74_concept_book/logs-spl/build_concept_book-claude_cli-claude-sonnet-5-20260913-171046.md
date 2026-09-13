# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 257 in / 595 out
- **Latency:** 14061ms
- **Timestamp:** 2026-09-13 17:10:46

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

Precision is the discipline of quantifying how much of a computed or measured quantity can be trusted. Formally, if $\hat{x}$ approximates a true value $x$, precision is captured by an error bound $|\hat{x} - x| \le \varepsilon$, or, in the relative sense used throughout scientific computing, $\left|\frac{\hat{x}-x}{x}\right| \le \delta$. Where earlier chapters treated exactness as an ideal, precision treats inexactness as a manageable quantity — the natural endpoint of a book that has built the tools of number, symbol, and approximation, because every one of those tools is eventually deployed on a machine with finite representable digits.

**Worked example.** Consider $x = \sqrt{2}$, truncated to six decimal digits: $\hat{x} = 1.414214$. Since $\sqrt{2} = 1.41421356\ldots$, the absolute error is $|\hat{x}-x| \approx 4.4\times 10^{-7}$, well within the bound $\varepsilon = 5\times10^{-7}$ guaranteed by rounding to six places. This single bound propagates: if $\hat{x}$ feeds into $f(\hat{x})$ for smooth $f$, the first-order error estimate $|f(\hat{x})-f(x)| \approx |f'(x)|\cdot|\hat{x}-x|$ tells us exactly how much confidence survives the computation.

**Key theorem (error propagation).** If $f$ is differentiable at $x$ and $\hat{x} = x + \epsilon$ with $|\epsilon|$ small, then
$$f(\hat{x}) = f(x) + f'(x)\epsilon + O(\epsilon^2),$$
so the relative error in $f(\hat{x})$ is governed by the *condition number* $\left|\frac{x f'(x)}{f(x)}\right|$. This single idea — precision in, condition number, precision out — is what makes finite-precision computation predictable rather than accidental.

This is why precision is the capstone: it governs numerical simulation (stable time-stepping in differential equations), cryptography (exact modular arithmetic despite bounded word sizes), machine learning (quantization and mixed-precision training), and experimental physics (propagating measurement uncertainty through derived quantities). Each domain is, at its core, an exercise in tracking $\varepsilon$ through a chain of operations.

**Lab cell.**
```python
import sympy as sp

x = sp.Rational(2)**sp.Rational(1,2)
x_hat = sp.Float(1.414214, 10)
error = sp.Abs(sp.N(x, 20) - x_hat)
print(error)  # absolute error, verified symbolically
```

Choose one application above and trace, step by step, how its error bound is built from this same inequality.
```
