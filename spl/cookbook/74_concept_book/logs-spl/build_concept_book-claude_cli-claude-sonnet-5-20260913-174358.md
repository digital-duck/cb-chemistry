# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 256 in / 836 out
- **Latency:** 16310ms
- **Timestamp:** 2026-09-13 17:43:58

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

The concept of **SI units** completes the arc of quantitative reasoning by binding every abstract measurement to a coherent, internationally agreed reference system. Formally, a system of units assigns to each physical quantity $Q$ a pair $(x, [u])$ such that $Q = x \cdot [u]$, where $x \in \mathbb{R}$ is a numerical value and $[u]$ is a unit drawn from a base set $\{\text{m}, \text{kg}, \text{s}, \text{A}, \text{K}, \text{mol}, \text{cd}\}$ or a coherent derived combination thereof. Coherence means that derived units arise from base units by pure multiplication and division, with no numerical scaling factor — for instance, the newton, $\text{N} = \text{kg} \cdot \text{m} \cdot \text{s}^{-2}$, requires no conversion constant. This is why si_units is the natural endpoint of the concept-book: every prior concept — vectors, derivatives, differential equations, physical laws — only becomes an operational, communicable, and falsifiable statement once its quantities are expressed in a shared unit system. Without this closure, a formula like $F = ma$ is a syntactic relation between symbols; with it, $F = ma$ becomes a measurable prediction that any laboratory in the world can reproduce.

**Worked example.** Consider Newton's second law applied to a $2\ \text{kg}$ mass accelerating at $3\ \text{m/s}^2$: $F = (2\ \text{kg})(3\ \text{m/s}^2) = 6\ \text{kg} \cdot \text{m/s}^2 = 6\ \text{N}$. The dimensional consistency of the right-hand side — kilograms times meters per second squared collapsing into the coherent derived unit newton — is itself a proof sketch of the theorem below.

**Key theorem (Dimensional Homogeneity).** If an equation correctly describes a physical law, every additive term must reduce to the same combination of base SI units. This principle underlies dimensional analysis, unit conversion, and error-checking in every applied domain.

This is where si_units becomes generative rather than terminal. In **mechanics**, it lets $F=ma$, momentum, and energy interoperate without conversion friction. In **thermodynamics**, it anchors temperature (K), pressure (Pa $=\text{kg}\cdot\text{m}^{-1}\cdot\text{s}^{-2}$), and entropy to a single coherent framework, making the ideal gas law $PV=nRT$ dimensionally checkable at a glance. In **electromagnetism**, it unifies charge, current, and field strength through the ampere and derived units like the tesla and volt, enabling Maxwell's equations to be verified unit-by-unit. In **chemistry and molecular biology**, the mole ties macroscopic mass to microscopic particle count, making stoichiometry and reaction-rate laws quantitatively meaningful. In **engineering design**, coherent units eliminate the silent errors that arise from mixing imperial and metric conventions — the very failure mode that famously doomed the Mars Climate Orbiter.

**Lab cell (SymPy).**
```python
import sympy.physics.units as u
from sympy.physics.units import convert_to

F = 2 * u.kg * 3 * (u.m / u.s**2)
print(convert_to(F, u.newton))  # 6*newton
```

From here, one natural next step is to explore how dimensional analysis — a direct consequence of si_units — can be used to *derive* physical laws from first principles, as in the classical example of predicting the period of a pendulum from $g$, $\ell$, and $m$ alone, without solving a single differential equation.
```
