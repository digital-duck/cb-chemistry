# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 0 in / 0 out
- **Latency:** 368ms
- **Timestamp:** 2026-09-13 18:00:39

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
```
