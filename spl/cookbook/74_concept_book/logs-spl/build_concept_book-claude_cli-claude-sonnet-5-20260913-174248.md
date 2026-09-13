# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 1066 in / 2077 out
- **Latency:** 44147ms
- **Timestamp:** 2026-09-13 17:42:48

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

## Dimensional Analysis

**Definition.** Every physical quantity $Q$ can be expressed as a product of powers of fundamental dimensions—typically mass $\mathsf{M}$, length $\mathsf{L}$, and time $\mathsf{T}$—written as a *dimensional formula* $[Q] = \mathsf{M}^a \mathsf{L}^b \mathsf{T}^c$. Dimensional analysis is the study of relationships among physical quantities by tracking these exponents, independent of the numerical values or units chosen (SI, CGS, etc.). A valid physical equation must be *dimensionally homogeneous*: every additive term must carry the same dimensional formula.

**Worked example.** Consider the period $T$ of a simple pendulum, hypothesized to depend on its length $\ell$, mass $m$, and gravitational acceleration $g$. Assume $T = k\, \ell^a m^b g^c$ for some dimensionless constant $k$. Substituting dimensions—$[T]=\mathsf{T}$, $[\ell]=\mathsf{L}$, $[m]=\mathsf{M}$, $[g]=\mathsf{L}\mathsf{T}^{-2}$—gives
$$\mathsf{T} = \mathsf{L}^a \mathsf{M}^b (\mathsf{L}\mathsf{T}^{-2})^c = \mathsf{L}^{a+c}\mathsf{M}^b\mathsf{T}^{-2c}.$$
Matching exponents: $b=0$ (mass), $-2c=1 \Rightarrow c=-\tfrac12$, and $a+c=0 \Rightarrow a=\tfrac12$. Thus $T = k\sqrt{\ell/g}$, recovering the correct functional form without solving the pendulum's differential equation.

**Key theorem (Buckingham $\pi$ theorem).** If a physical relation among $n$ variables involves $r$ independent fundamental dimensions, the relation can be rewritten equivalently in terms of $n-r$ dimensionless groups $\pi_1, \dots, \pi_{n-r}$. This theorem guarantees that dimensional analysis, though it cannot determine dimensionless constants like $k$, always reduces the complexity of a physical law by exactly $r$ parameters.

**Lab cell (SymPy).**
```python
from sympy import symbols, Rational, solve, Eq

a, b, c = symbols('a b c')
# [T]=T, [l]=L, [m]=M, [g]=L*T^-2
eqs = [Eq(b, 0), Eq(-2*c, 1), Eq(a + c, 0)]
sol = solve(eqs, [a, b, c])
print(sol)  # {a: -1/2... solved as a=1/2 via a+c=0}
```

---

## Unit Conversion Factor

**Definition.** A unit conversion factor is a multiplicative constant $k$ relating a quantity expressed in one unit to the same quantity expressed in another unit, satisfying
$$
Q_{\text{new}} = k \cdot Q_{\text{old}},
$$
where $Q_{\text{old}}$ and $Q_{\text{new}}$ denote numerical measures of an identical physical quantity under two distinct unit systems. Because $Q_{\text{old}}$ and $Q_{\text{new}}$ represent the same underlying quantity, the conversion factor $k$ is dimensionless when expressed as a ratio of like units, i.e. $k = \dfrac{1\,\text{unit}_{\text{new}}}{1\,\text{unit}_{\text{old}}}$.

**Worked example.** Convert $x = 5$ miles to kilometers. Since $1\ \text{mile} = 1.60934\ \text{km}$, the conversion factor is $k = 1.60934$. Thus
$$
x_{\text{km}} = k \cdot x_{\text{mi}} = 1.60934 \times 5 = 8.0467\ \text{km}.
$$

**Key theorem (Composition of conversion factors).** If $k_{1}$ converts units $A \to B$ and $k_{2}$ converts units $B \to C$, then the composite factor converting $A \to C$ is
$$
k_{A \to C} = k_{2} \cdot k_{1}.
$$
*Proof sketch.* Let $Q_A$, $Q_B$, $Q_C$ denote the measures of the same physical quantity in units $A$, $B$, $C$ respectively. By definition, $Q_B = k_1 Q_A$ and $Q_C = k_2 Q_B$. Substituting the first into the second gives $Q_C = k_2 (k_1 Q_A) = (k_2 k_1) Q_A$, which matches the defining relation for $k_{A\to C}$. Uniqueness follows since $Q_A \neq 0$ in general, forcing $k_{A\to C} = k_2 k_1$. $\blacksquare$

**Lab cell (SymPy).**
```python
from sympy import Rational, nsimplify

mile_to_km = Rational(160934, 100000)  # exact rational approximation
x_miles = 5
x_km = mile_to_km * x_miles
print(f"{x_miles} miles = {float(x_km):.4f} km")

# Composition example: miles -> km -> meters
km_to_m = 1000
mile_to_m = mile_to_km * km_to_m
print(f"1 mile = {float(mile_to_m):.2f} meters")
```

---

## Payoff

The concept of a **unit conversion factor** distills the entire preceding development—dimensional analysis, base quantities, and derived units—into a single computational device: a multiplicative constant $k$ satisfying $1\,[\text{unit}_A] = k \cdot [\text{unit}_B]$, where $[\text{unit}_A]$ and $[\text{unit}_B]$ measure the same physical quantity in different systems. Formally, if $Q$ is a physical quantity expressible as $Q = x_A\,[\text{unit}_A] = x_B\,[\text{unit}_B]$, then $x_B = k\,x_A$, with $k$ determined entirely by the ratio of the units' definitions in a common base (e.g., SI). This is the natural endpoint of the book because every prior concept—dimensional homogeneity, base and derived quantities, the algebra of exponents on units—exists precisely to justify why such a $k$ is well-defined and uniquely determined, independent of the numerical value of $Q$ itself.

The payoff is breadth: a single mechanism now unlocks fluency across domains that appear unrelated on the surface. In **engineering**, it governs the translation between imperial and metric measurements in structural and mechanical design, where an error in $k$ propagates directly into safety margins. In **physics**, it underlies unit-consistent evaluation of derived formulas—converting energy from joules to electronvolts, or pressure from pascals to atmospheres—without altering the physical content of an equation. In **chemistry**, molar conversions (e.g., grams to moles via molar mass, itself a conversion factor) rely on exactly this structure. In **data science and computing**, conversions between byte-based storage units ($1\,\text{KiB} = 1024\,\text{B}$) follow the identical algebraic template, despite the base differing from decimal to binary.

**Worked example.** Convert $60\ \text{mph}$ to $\text{m/s}$: $k = \dfrac{1609.34\ \text{m}}{3600\ \text{s}} \approx 0.44704$, giving $60 \times 0.44704 \approx 26.82\ \text{m/s}$.

**Key theorem (Composability).** If $k_{A\to B}$ and $k_{B\to C}$ are conversion factors, then $k_{A\to C} = k_{A\to B} \cdot k_{B\to C}$—conversion factors form a multiplicative group action on measurement scales.

```python
from sympy import Rational, nsimplify
k = Rational(1609344, 1000) / 3600  # mph -> m/s
print(60 * k, float(60 * k))
```

We invite you to pursue one thread further: trace how unit_conversion_factor, composed across a chain of derived units, resolves the energy conversions central to thermodynamics.
```
