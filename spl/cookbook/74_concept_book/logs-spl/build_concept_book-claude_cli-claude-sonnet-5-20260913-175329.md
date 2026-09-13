# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 0 in / 0 out
- **Latency:** 357ms
- **Timestamp:** 2026-09-13 17:53:29

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

## Si Units

**Definition.** The International System of Units (SI) is the coherent system of measurement built from seven base units, each defined by a fixed value of a fundamental physical constant: the second ($\mathrm{s}$, via the cesium-133 hyperfine transition frequency), the meter ($\mathrm{m}$, via the speed of light $c$), the kilogram ($\mathrm{kg}$, via the Planck constant $h$), the ampere ($\mathrm{A}$, via the elementary charge $e$), the kelvin ($\mathrm{K}$, via the Boltzmann constant $k_B$), the mole ($\mathrm{mol}$, via the Avogadro constant $N_A$), and the candela ($\mathrm{cd}$, via a fixed luminous efficacy). Every other physical unit, called a *derived unit*, is expressed as a product of powers of these seven: $[Q] = \mathrm{m}^{a}\,\mathrm{kg}^{b}\,\mathrm{s}^{c}\,\mathrm{A}^{d}\,\mathrm{K}^{e}\,\mathrm{mol}^{f}\,\mathrm{cd}^{g}$.

**Worked example.** Consider force, defined by Newton's second law $F = ma$. Since $[m] = \mathrm{kg}$ and $[a] = \mathrm{m}\,\mathrm{s}^{-2}$, dimensional consistency requires $[F] = \mathrm{kg}\cdot\mathrm{m}\cdot\mathrm{s}^{-2}$, which we name the newton: $1\,\mathrm{N} = 1\,\mathrm{kg}\cdot\mathrm{m}\cdot\mathrm{s}^{-2}$. This illustrates how derived units inherit their exponents directly from a governing physical law.

**Key theorem (Buckingham $\pi$ theorem).** If a physical relationship among $n$ dimensional variables involves $k$ independent base dimensions, it can be rewritten equivalently as a relationship among $n-k$ dimensionless groups $\pi_1, \dots, \pi_{n-k}$. This theorem justifies dimensional analysis as a method for checking equations and constructing scale-invariant physical laws without solving the underlying differential equations explicitly.

**Lab cell (SymPy).**
```python
import sympy as sp
from sympy.physics.units import kg, m, s, N, convert_to

# Verify F = m*a has units of newtons
mass = 2 * kg
accel = 3 * m / s**2
force = mass * accel

print(convert_to(force, N))   # -> 6*newton
```

---

## Payoff

The concept of *SI units* achieves something deceptively simple yet foundational: it attaches a rigorous, dimensionally consistent measurement standard to every physical quantity discussed throughout this book. Formally, an SI-compliant quantity $Q$ is expressed as
$$
Q = \{Q\} \cdot [Q],
$$
where $\{Q\} \in \mathbb{R}$ is the numerical value and $[Q]$ is a unit built from the seven base units—meter (m), kilogram (kg), second (s), ampere (A), kelvin (K), mole (mol), candela (cd)—combined via integer powers. This is the natural endpoint of the book because every prior concept, from vectors to differential equations to statistical estimators, describes *relationships between quantities*, but without a fixed unit system those relationships are ambiguous up to arbitrary rescaling. SI units close that gap, turning abstract mathematical structure into physically meaningful, internationally reproducible statements.

**Worked example.** Consider Newton's second law, $F = ma$. Substituting SI units: $[F] = \text{kg} \cdot \text{m} \cdot \text{s}^{-2}$, defining the derived unit newton (N). Dimensional consistency here is not decorative—it is a theorem-level constraint: any equation relating physical quantities must balance dimensions on both sides, a principle known as the *Buckingham $\pi$ theorem* in its general form.

**Key theorem (dimensional homogeneity).** If an equation $f(Q_1, \dots, Q_n) = 0$ correctly describes a physical law, then $f$ must be expressible as a function of dimensionless products $\pi_1, \dots, \pi_{n-r}$, where $r$ is the rank of the dimensional matrix of $Q_1, \dots, Q_n$.

```python
from sympy.physics.units import kg, m, s, N, convert_to
expr = 5*kg * (2*m/s**2)
print(convert_to(expr, N))  # 10*newton
```

SI units connect outward to every application domain this book unlocks: engineering design (stress, torque, power), physics simulation (energy conservation, electromagnetism), chemistry (molar concentration, reaction rates), and data science pipelines that ingest sensor measurements. Explore any one of these next—dimensional analysis in engineering design is a particularly rewarding place to start.
```
