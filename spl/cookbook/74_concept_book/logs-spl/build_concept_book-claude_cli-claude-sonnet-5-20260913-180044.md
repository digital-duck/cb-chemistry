# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 5289 in / 7281 out
- **Latency:** 157773ms
- **Timestamp:** 2026-09-13 18:00:44

## Output

```output


---

## Measurement

**Definition.** A *measurement* is the assignment of a numerical value, together with a unit, to a physical quantity through comparison with a defined standard. Formally, a measurement of quantity $Q$ is expressed as
$$Q = n \cdot [u]$$
where $n \in \mathbb{R}$ is the numerical magnitude and $[u]$ is the chosen unit. Because $n$ depends on the choice of $[u]$, a measurement is only meaningful when both components are stated together. Every measurement carries finite precision, characterized by an uncertainty $\delta Q$, so that the reported value is properly written $Q = n \cdot [u] \pm \delta Q$.

**Worked example.** Suppose a graduated cylinder reads a liquid volume of $24.6\ \text{mL}$, with the instrument's smallest division being $1\ \text{mL}$, so uncertainty is estimated as half that division: $\delta V = 0.5\ \text{mL}$. The measurement is reported as
$$V = 24.6 \pm 0.5\ \text{mL}.$$
Converting to liters using the SI unit relation $1\ \text{L} = 1000\ \text{mL}$ gives $V = 0.0246 \pm 0.0005\ \text{L}$, illustrating that unit conversion rescales $n$ and $\delta Q$ identically, preserving relative uncertainty $\delta Q / Q$.

**Key theorem (invariance of relative uncertainty).** For any measurement $Q = n[u]$ with uncertainty $\delta Q$, converting to a new unit $[u'] = k[u]$ yields $Q = (n/k)[u']$ with uncertainty $\delta Q / k$, and the relative uncertainty $\delta Q / Q$ is invariant under unit conversion. This follows directly from linearity: scaling both $n$ and $\delta Q$ by $1/k$ leaves their ratio unchanged.

**Lab cell (SymPy).**
```python
import sympy as sp

n, delta, k = sp.symbols('n delta k', positive=True)
Q = n
relative_uncertainty = delta / Q
converted_Q = n / k
converted_delta = delta / k
converted_relative = converted_delta / converted_Q

print(sp.simplify(relative_uncertainty - converted_relative))  # 0
```

---

## Matter

**Definition.** Matter is any entity that possesses mass and occupies volume. A sample of matter is characterized by two measurable quantities: mass $m$, measured in kilograms, and volume $V$, measured in cubic meters. Matter exists in the physical universe as one of several phases — solid, liquid, gas, or plasma — distinguished by the degree of particle organization and intermolecular spacing, and it is composed at the microscopic level of atoms and molecules.

**Worked example.** Consider a sample of aluminum with mass $m = 27.0\ \text{g}$ occupying a volume $V = 10.0\ \text{cm}^3$. The ratio of these two quantities,
$$
\frac{m}{V} = \frac{27.0\ \text{g}}{10.0\ \text{cm}^3} = 2.70\ \text{g/cm}^3,
$$
is the same for any aluminum sample regardless of its mass or volume, confirming that the sample is composed of matter with a well-defined, reproducible identity rather than an arbitrary combination of mass and volume.

**Key theorem (Conservation of Mass).** In any closed system undergoing a physical or chemical transformation, the total mass of matter is conserved:
$$
\sum_i m_i^{\text{initial}} = \sum_j m_j^{\text{final}}.
$$
*Proof sketch.* This follows from the atomic theory of matter: chemical reactions rearrange atoms into new molecular configurations but neither create nor destroy them. Since mass is additive over constituent atoms, and the number and identity of atoms of each element is preserved, the summed atomic masses — and hence total mass — remain invariant before and after the transformation.

**Lab cell (SymPy).**
```python
from sympy import symbols, Rational, solve

m, V = symbols('m V', positive=True)
mass_volume_ratio = m/V - Rational(27, 10)

# Given m/V = 2.70 g/cm^3 and V = 10.0 cm^3, solve for m
solution = solve(mass_volume_ratio.subs({V: 10}), m)
print(solution)  # [27.0000000000000]
```

---

## Si Units

The Système International d'Unités (SI) is the internationally agreed system of measurement consisting of seven base units, each defined by fixing the numerical value of a fundamental physical constant. The base units are the second ($\mathrm{s}$, time), meter ($\mathrm{m}$, length), kilogram ($\mathrm{kg}$, mass), ampere ($\mathrm{A}$, electric current), kelvin ($\mathrm{K}$, thermodynamic temperature), mole ($\mathrm{mol}$, amount of substance), and candela ($\mathrm{cd}$, luminous intensity). All other physical quantities are expressed as *derived units*, formed by multiplying or dividing powers of the base units — for example, the unit of density is $\mathrm{kg/m^3}$ and the unit of force, the newton, is $\mathrm{N} = \mathrm{kg \cdot m \cdot s^{-2}}$.

**Worked example.** Suppose a laboratory sample has a volume of $2.50\ \mathrm{cm^3}$ and a mass of $6.75\ \mathrm{g}$. To express its density in SI base units, convert: $2.50\ \mathrm{cm^3} = 2.50 \times 10^{-6}\ \mathrm{m^3}$ and $6.75\ \mathrm{g} = 6.75 \times 10^{-3}\ \mathrm{kg}$. Then
$$
\rho = \frac{m}{V} = \frac{6.75 \times 10^{-3}\ \mathrm{kg}}{2.50 \times 10^{-6}\ \mathrm{m^3}} = 2.70 \times 10^{3}\ \mathrm{kg/m^3}.
$$

**Key theorem (dimensional coherence).** Because SI is a coherent system, any derived unit is obtained from the base units using only the operations of multiplication and division by integer powers, with no additional numerical conversion factors. Consequently, an equation relating physical quantities is dimensionally consistent if and only if both sides reduce to the same combination of base-unit exponents — a necessary (though not sufficient) condition for the equation's correctness.

**Lab cell (SymPy).**
```python
from sympy import Rational, symbols
from sympy.physics.units import kg, m, cm, g, s, convert_to

mass = Rational(675, 100) * g
volume = Rational(250, 100) * cm**3
density = convert_to(mass / volume, kg / m**3)
print(density)  # 2700 kg/m**3
```

---

## Physical Property

**Definition.** A *physical property* of a substance is any characteristic that can be observed or measured without altering the chemical identity of that substance — that is, without breaking or forming chemical bonds. Formally, if a substance $S$ is described by a state function $f(S)$ that remains defined for $S$ before and after the observation, and no new substance $S'$ with a distinct molecular composition is produced, then $f$ is a physical property. Common examples include density $\rho = m/V$, melting point $T_m$, boiling point $T_b$, color, hardness, and electrical conductivity. This contrasts with a *chemical property*, which describes a substance's tendency to undergo a transformation into a different substance (e.g., flammability, reactivity with acid).

**Worked example.** Consider a $50.0\ \text{g}$ sample of an unknown liquid that occupies $63.3\ \text{cm}^3$ at $20^\circ\text{C}$. Its density is
$$\rho = \frac{m}{V} = \frac{50.0\ \text{g}}{63.3\ \text{cm}^3} \approx 0.790\ \text{g/cm}^3.$$
Comparing this value to a reference table identifies the liquid as ethanol ($\rho \approx 0.789\ \text{g/cm}^3$). Note that measuring $\rho$ required only weighing and volume displacement — no chemical reaction occurred, so density qualifies as a physical property.

**Key theorem (invariance under state description).** *If $f$ is a physical property of substance $S$, then $f(S)$ is independent of the amount of $S$ sampled, provided $f$ is intensive.* This follows because intensive physical properties are ratios of two extensive quantities (e.g., $\rho = m/V$) that scale identically with sample size, so the quotient is invariant — a proof sketch by direct substitution of $m \to km$, $V \to kV$ for scaling factor $k$.

**Lab cell (SymPy).**
```python
from sympy import symbols, simplify

m, V, k = symbols('m V k', positive=True)
rho = m / V
rho_scaled = (k*m) / (k*V)
print(simplify(rho_scaled - rho))  # 0, confirming density is intensive
```

---

## Intensive Property

**Definition.** A physical property $P$ of a system is called *intensive* if its value does not depend on the amount of substance present. Formally, if a homogeneous system is partitioned into two subsystems of masses $m_1$ and $m_2$, an intensive property satisfies
$$
P(\text{subsystem}_1) = P(\text{subsystem}_2) = P(\text{whole system}),
$$
whereas an *extensive* property $E$ scales additively, $E_{\text{whole}} = E_1 + E_2$. Common intensive properties include density $\rho$, temperature $T$, pressure $p$, and molar concentration $c$; common extensive properties include mass $m$, volume $V$, and total energy $U$.

**Worked example.** Consider a sample of ethanol with mass $m = 50\,\text{g}$ occupying volume $V = 63.3\,\text{cm}^3$ at $20^\circ\text{C}$. Its density is
$$
\rho = \frac{m}{V} = \frac{50\,\text{g}}{63.3\,\text{cm}^3} \approx 0.790\,\text{g/cm}^3.
$$
If the sample is split in half, each half has $m = 25\,\text{g}$ and $V = 31.65\,\text{cm}^3$, yet $\rho = 25/31.65 \approx 0.790\,\text{g/cm}^3$ unchanged — confirming that density is intensive, while mass and volume, having been halved, are extensive.

**Key theorem.** *Any ratio of two extensive properties of the same homogeneous system is intensive.* Proof sketch: let $E_1, E_2$ be extensive, so under partition into $n$ identical subsystems, $E_1 = n e_1$ and $E_2 = n e_2$ for per-subsystem values $e_1, e_2$. Then $E_1/E_2 = e_1/e_2$, independent of $n$, hence independent of system size. This explains why density ($m/V$), molar mass ($m/n$), and specific heat ($C/m$) are intensive despite being built from extensive quantities.

**Lab cell (SymPy):**
```python
from sympy import symbols, Rational

m, V, n = symbols('m V n', positive=True)
rho = m / V                      # intensive: ratio of extensives
rho_scaled = (n*m) / (n*V)       # scaling both by n
print(rho_scaled.simplify() == rho)   # True: confirms intensive invariance
```

---

## Mass

**Definition.** Mass, denoted $m$, is a scalar quantity measuring the amount of matter in a body and its resistance to acceleration under an applied force. In the SI system, mass is measured in kilograms $(\mathrm{kg})$. Mass is an extensive property: it scales with the size of the system, and the mass of a composite system is the sum of the masses of its parts, provided no significant mass–energy conversion occurs.

**Worked example.** Consider a sample of pure aluminum with volume $V = 10.0\ \mathrm{cm}^3$ and known density $\rho = 2.70\ \mathrm{g/cm}^3$. Using the relation $\rho = m/V$ established in the previous section, the mass is
$$
m = \rho V = (2.70\ \mathrm{g/cm}^3)(10.0\ \mathrm{cm}^3) = 27.0\ \mathrm{g} = 0.0270\ \mathrm{kg}.
$$
This illustrates how mass is inferred indirectly from other measurable quantities, a common laboratory strategy.

**Key theorem (Conservation of mass).** In any closed system undergoing a physical or ordinary chemical process (non-nuclear), the total mass is conserved:
$$
\sum_i m_i^{\text{initial}} = \sum_j m_j^{\text{final}}.
$$
This principle, formalized by Lavoisier, underlies stoichiometric calculations: mass is neither created nor destroyed, only redistributed among reacting species.

**Lab cell (SymPy).**
```python
import sympy as sp

rho, V, m = sp.symbols('rho V m', positive=True)
mass_expr = sp.Eq(m, rho * V)

# Evaluate for aluminum sample
result = mass_expr.rhs.subs({rho: 2.70, V: 10.0})
print(f"m = {result} g = {result/1000} kg")
```
This snippet symbolically encodes $m = \rho V$ and evaluates it numerically, letting students verify unit consistency and extend the calculation to other densities or volumes.

---

## Measurement Uncertainty

**Definition.** Every physical measurement is an estimate, not an exact value, because it is limited by the resolution of the instrument and the skill of the observer. The *uncertainty* of a measurement, denoted $\delta x$, is the range within which the true value is believed to lie. A reported measurement is written as $x \pm \delta x$, where $x$ is the best estimate and $\delta x$ reflects the precision of the measuring device. By convention, the uncertainty is taken as half of the smallest division on an analog instrument, or the last significant digit on a digital readout.

**Worked example.** A student measures the length of a metal rod using a ruler marked in millimeters. The rod's edge falls between the 15.2 cm and 15.3 cm marks, closer to 15.2 cm, so the student records $15.24 \pm 0.05\ \text{cm}$. The uncertainty $\delta x = 0.05\ \text{cm}$ arises because the observer can reliably estimate only to half of the smallest division (1 mm). Any reported value beyond this precision — such as claiming $15.243\ \text{cm}$ — would be scientifically unjustified.

**Key theorem (propagation of uncertainty).** When a quantity $z$ is calculated from measured quantities $x$ and $y$, each with uncertainty $\delta x$ and $\delta y$, the propagated uncertainty follows from the total differential:
$$
\delta z = \left| \frac{\partial z}{\partial x} \right| \delta x + \left| \frac{\partial z}{\partial y} \right| \delta y.
$$
For $z = x + y$ or $z = x - y$, uncertainties add directly: $\delta z = \delta x + \delta y$. For $z = xy$ or $z = x/y$, relative uncertainties add: $\dfrac{\delta z}{z} = \dfrac{\delta x}{x} + \dfrac{\delta y}{y}$.

**Lab cell (SymPy).**
```python
import sympy as sp

x, y, dx, dy = sp.symbols('x y delta_x delta_y', positive=True)
z = x * y
dz = sp.Abs(sp.diff(z, x)) * dx + sp.Abs(sp.diff(z, y)) * dy
dz_relative = sp.simplify(dz / z)
print(dz_relative)  # delta_x/x + delta_y/y
```

---

## Precision

**Definition.** Precision refers to the degree of reproducibility of a measurement — the extent to which repeated measurements of the same quantity, under unchanged conditions, agree with one another. Formally, if a set of $n$ measurements $\{x_1, x_2, \ldots, x_n\}$ is obtained, precision is quantified by the spread of these values about their mean $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$, typically via the sample standard deviation:
$$
s = \sqrt{\frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2}.
$$
A small $s$ relative to $\bar{x}$ indicates high precision. Note that precision is distinct from *accuracy*, which measures agreement with a true or accepted value; a set of measurements may be precise (tightly clustered) yet inaccurate (systematically offset from the true value) due to a consistent instrumental or procedural bias.

**Worked example.** Suppose a student measures the mass of a sample five times using an analytical balance, obtaining (in grams): $12.61, 12.63, 12.60, 12.64, 12.62$. The mean is $\bar{x} = 12.620\ \text{g}$. Computing the deviations and applying the formula above yields $s \approx 0.0158\ \text{g}$. Since $s$ is small relative to $\bar{x}$ (a relative standard deviation of about $0.13\%$), the measurements are highly precise.

**Key theorem.** As $n \to \infty$, under the assumption of independent, identically distributed measurement errors with finite variance $\sigma^2$, the sample standard deviation $s$ converges to the true population standard deviation $\sigma$ (a consequence of the Law of Large Numbers), and the standard error of the mean, $s/\sqrt{n}$, decreases as $n$ increases — precision improves with repeated trials, though systematic (accuracy) errors are unaffected by increasing $n$.

**Lab cell (SymPy).**
```python
import sympy as sp

data = [12.61, 12.63, 12.60, 12.64, 12.62]
n = len(data)
mean = sp.Rational(sum(data)).limit_denominator() / n
variance = sum((sp.Float(x) - mean)**2 for x in data) / (n - 1)
std_dev = sp.sqrt(variance)

print("Mean:", sp.N(mean, 5))
print("Standard deviation (precision measure):", sp.N(std_dev, 5))
```

---

## Volume

**Definition.** Volume is the extensive physical property that quantifies the three-dimensional space occupied by a sample of matter. For a solid object with well-defined geometric boundaries, volume is given by
$$V = \int_{\Omega} \, dx\,dy\,dz,$$
the triple integral of unity over the spatial region $\Omega$ occupied by the object. In chemistry, volume is most often reported for liquids and gases, measured in SI units of cubic meters ($\mathrm{m^3}$), though the derived unit liter ($\mathrm{L} = 10^{-3}\,\mathrm{m^3}$) and milliliter ($\mathrm{mL} = 1\,\mathrm{cm^3}$) are standard in laboratory practice.

**Worked example.** A graduated cylinder contains water to a level of $45.0\,\mathrm{mL}$. A metal sample is submerged, and the water level rises to $52.3\,\mathrm{mL}$. By the principle of displacement — a direct consequence of the additivity of volume for non-overlapping regions, $V(\Omega_1 \cup \Omega_2) = V(\Omega_1) + V(\Omega_2)$ when $\Omega_1 \cap \Omega_2 = \emptyset$ — the volume of the metal sample is
$$V_{\text{sample}} = 52.3\,\mathrm{mL} - 45.0\,\mathrm{mL} = 7.3\,\mathrm{mL}.$$

**Key theorem.** Volume is an extensive property: for a system partitioned into $n$ disjoint subregions, $V_{\text{total}} = \sum_{i=1}^{n} V_i$. This additivity underlies both the displacement method above and the definition of density, $\rho = m/V$, since combining two samples of the same substance doubles both mass and volume while leaving their ratio — the intensive property density — unchanged.

**Lab cell (SymPy).**
```python
import sympy as sp

r, h = sp.symbols('r h', positive=True)
V_cylinder = sp.pi * r**2 * h
V_numeric = V_cylinder.subs({r: 1.25, h: 5.00})  # cm
print(sp.nsimplify(V_numeric), "cm^3 ->", float(V_numeric), "cm^3")
```

---

## Density

**Definition.** The density of a substance is the ratio of its mass to its volume:
$$
\rho = \frac{m}{V},
$$
where $m$ is mass (typically in grams or kilograms) and $V$ is volume (in cubic centimeters or cubic meters). Density is an intensive property: it does not depend on the amount of material present, since doubling both $m$ and $V$ leaves the ratio $\rho$ unchanged. This distinguishes it from mass and volume individually, which are extensive properties. Common units include $\mathrm{g/cm^3}$ and $\mathrm{kg/m^3}$, with the conversion factor $1\ \mathrm{g/cm^3} = 1000\ \mathrm{kg/m^3}$.

**Worked example.** Suppose a sample of aluminum has a mass of $54.0\ \mathrm{g}$ and occupies a volume of $20.0\ \mathrm{cm^3}$. Its density is
$$
\rho = \frac{54.0\ \mathrm{g}}{20.0\ \mathrm{cm^3}} = 2.70\ \mathrm{g/cm^3},
$$
consistent with the accepted density of aluminum. If instead we are given $\rho$ and $m$, the volume follows by rearrangement: $V = m/\rho$.

**Key theorem (invariance under scaling).** If a homogeneous sample of mass $m$ and volume $V$ is partitioned into $n$ identical pieces, each piece has mass $m/n$ and volume $V/n$, so the density of each piece equals
$$
\rho_{\text{piece}} = \frac{m/n}{V/n} = \frac{m}{V} = \rho.
$$
This confirms formally that density is scale-invariant and depends only on the intrinsic composition and phase of the material, not on sample size.

**Lab cell (SymPy).**
```python
from sympy import symbols, Eq, solve

m, V, rho = symbols('m V rho', positive=True)
density_eq = Eq(rho, m / V)

# Solve for volume given mass and density
solution = solve(density_eq.subs({m: 54.0, rho: 2.70}), V)
print(solution)  # [20.0000000000000]
```

---

## Dimensional Analysis

**Definition.** Dimensional analysis is the systematic verification and manipulation of physical quantities based on their fundamental dimensions—length ($\mathrm{L}$), mass ($\mathrm{M}$), time ($\mathrm{T}$), and others—independent of the specific units chosen to express them. Every measured quantity $Q$ can be written as $Q = \{Q\} \cdot [Q]$, where $\{Q\}$ is a numerical value and $[Q]$ is a unit carrying dimensional information. Because physical equations must be dimensionally homogeneous, both sides of any valid equation must reduce to the same combination of base dimensions. This principle underlies the technique of **unit conversion via conversion factors**: multiplying a quantity by a ratio equal to $1$ (e.g., $\dfrac{1\ \text{km}}{1000\ \text{m}} = 1$) changes its units without changing its physical magnitude.

**Worked example.** Convert a density of $\rho = 1.06\ \text{g/mL}$ to $\text{kg/m}^3$. Using the conversion chain
$$
\rho = 1.06\ \frac{\text{g}}{\text{mL}} \times \frac{1\ \text{kg}}{1000\ \text{g}} \times \frac{1000\ \text{mL}}{1\ \text{L}} \times \frac{1000\ \text{L}}{1\ \text{m}^3} = 1060\ \frac{\text{kg}}{\text{m}^3}.
$$
Each factor equals unity dimensionally, so only the numerical value changes, and the dimension $\mathrm{M}\,\mathrm{L}^{-3}$ is preserved throughout.

**Key theorem.** The **Buckingham $\pi$ theorem** formalizes dimensional analysis: if a physical relationship among $n$ variables involves $k$ independent fundamental dimensions, it can be reduced to a relationship among $n - k$ dimensionless groups $\pi_1, \pi_2, \ldots, \pi_{n-k}$. This guarantees that any dimensionally consistent physical law can be expressed purely in terms of dimensionless ratios, which is the theoretical foundation for unit-factor conversions and scaling arguments in the physical sciences.

**Lab cell (SymPy).**
```python
from sympy.physics.units import convert_to, gram, milliliter, kilogram, meter

rho = 1.06 * gram / milliliter
rho_SI = convert_to(rho, kilogram / meter**3)
print(rho_SI)  # 1060*kilogram/meter**3
```

---

## Significant Figures

**Definition.** The *significant figures* (or significant digits) of a measured quantity are the digits that carry meaningful information about the precision of a measurement: all non-zero digits, any zeros between non-zero digits, and trailing zeros to the right of a decimal point. Leading zeros (e.g., in $0.0042$) are never significant, since they merely locate the decimal point. Formally, if a measurement is written in scientific notation as $a \times 10^{n}$ with $1 \le |a| < 10$, the number of significant figures equals the number of digits retained in the mantissa $a$.

**Worked example.** Consider the measured mass $m = 0.003080\ \text{g}$. Rewriting in scientific notation, $m = 3.080 \times 10^{-3}\ \text{g}$. The mantissa $3.080$ contains four digits, so $m$ has four significant figures: the leading zeros in $0.003080$ are not significant, but the trailing zero after the "8" is, since it lies to the right of the decimal point and signals that the measurement was resolved to that precision.

**Key theorem (propagation of significant figures).** When quantities are multiplied or divided, the result should be rounded to the number of significant figures possessed by the least precise factor:
$$
q = x_1 \cdot x_2 \implies \text{sig. figs.}(q) = \min\big(\text{sig. figs.}(x_1),\ \text{sig. figs.}(x_2)\big).
$$
The intuition behind this rule is that the least-precise factor sets a floor on how well the product can be known: a factor with only three significant figures constrains the product to at most three significant figures, no matter how many digits the other factor supplies, since any additional digits in the product would imply a precision the inputs cannot support.

**Lab cell (SymPy).**
```python
from sympy import Rational, log, floor

def sig_figs(x, n):
    """Round x to n significant figures."""
    if x == 0:
        return 0
    d = int(floor(log(abs(x), 10))) + 1
    power = n - d
    factor = Rational(10) ** power
    return round(x * factor) / factor

print(sig_figs(3.0800, 4))  # -> 3.080
```

---

## Density Calculation

**Definition.** Density, denoted $\rho$, is the physical property defined as the ratio of an object's mass $m$ to its volume $V$:
$$
\rho = \frac{m}{V}.
$$
Density is an intensive property: it does not depend on the amount of substance present, since scaling both $m$ and $V$ by the same factor leaves their ratio unchanged. In SI units, density is expressed in kilograms per cubic meter ($\mathrm{kg/m^3}$), though chemists commonly report it in grams per cubic centimeter ($\mathrm{g/cm^3}$) or grams per milliliter ($\mathrm{g/mL}$), which are numerically equivalent for liquids and solids.

**Worked example.** A sample of aluminum has a mass of $54.0\ \mathrm{g}$ and occupies a volume of $20.0\ \mathrm{cm^3}$. Its density is
$$
\rho = \frac{m}{V} = \frac{54.0\ \mathrm{g}}{20.0\ \mathrm{cm^3}} = 2.70\ \mathrm{g/cm^3}.
$$
This value matches the accepted density of aluminum, confirming the sample's identity.

**Key theorem (dimensional consistency and rearrangement).** Because $\rho$, $m$, and $V$ are related by a single algebraic equation, any two quantities determine the third:
$$
m = \rho V, \qquad V = \frac{m}{\rho}.
$$
Dimensional analysis guarantees consistency: $[\rho][V] = (\mathrm{g/cm^3})(\mathrm{cm^3}) = \mathrm{g}$, matching the units of mass. This algebraic invertibility underlies density's use as a conversion factor between mass and volume in stoichiometric and laboratory calculations.

**Lab cell (SymPy).**
```python
import sympy as sp

m, V, rho = sp.symbols('m V rho', positive=True)
density_eq = sp.Eq(rho, m / V)

# Solve for volume given mass and density
solution = sp.solve(density_eq, V)[0]
result = solution.subs({m: 54.0, rho: 2.70})
print(f"Volume = {result} cm^3")  # Volume = 20.0 cm^3
```

---

## Payoff

Density calculation is the point at which measurement and arithmetic become chemical reasoning. Formally, given a mass measurement $m$ (with units of grams or kilograms) and a volume measurement $V$ (with units of $\text{cm}^3$, $\text{mL}$, or $\text{m}^3$), the density is defined as

$$
\rho = \frac{m}{V}, \qquad [\rho] = \frac{[\text{mass}]}{[\text{length}]^3}.
$$

This single ratio synthesizes every prerequisite skill in this book: recognizing mass and volume as extensive properties, applying dimensional analysis to reconcile mismatched units, and reporting the result to the correct number of significant figures given the precision of the underlying instruments. The proof that $\rho$ is well-defined as an *intensive* property follows directly from the extensivity of $m$ and $V$: if a sample of substance is partitioned into $n$ identical pieces, each piece has mass $m/n$ and volume $V/n$, so $\rho = (m/n)/(V/n) = m/V$ is invariant under partition — density characterizes the substance, not the sample.

**Worked example.** A student measures a $47.3\ \text{g}$ sample of an unknown liquid that occupies $52.6\ \text{mL}$. Applying the formula, $\rho = 47.3\ \text{g} / 52.6\ \text{mL} = 0.899\ \text{g/mL}$, reported to three significant figures — matching the precision of the least-precise measurement, the mass.

```python
from sympy import Rational, N

m = Rational(473, 10)   # 47.3 g
V = Rational(526, 10)   # 52.6 mL
rho = m / V
print(f"rho = {N(rho, 3)} g/mL")
```

Density calculation is the natural endpoint of this progression because it is the first quantity in the course that requires no further conceptual scaffolding to *use*: once computed, $\rho$ becomes an identifying fingerprint for substances, a tool for verifying purity, and an input to countless downstream problems in stoichiometry, buoyancy, and phase behavior — each of which begins by asking "what is this substance's density?" and proceeds from the number this concept teaches you to produce correctly.

We invite you to take this computational fluency into the laboratory: choose an unfamiliar liquid or solid, measure its mass and volume with appropriate instruments, and use the method above to determine — and defend, with proper significant figures — its density.
```
