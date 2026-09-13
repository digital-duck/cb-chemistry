# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 525 in / 1221 out
- **Latency:** 24260ms
- **Timestamp:** 2026-09-13 17:53:51

## Output

```output


---

## Matter

**Definition.** In classical physics, *matter* is any substance that possesses mass and occupies volume, thereby exhibiting inertia and interacting through gravitational and electromagnetic forces. Formally, a body of matter is characterized by a mass density function $\rho(\mathbf{r}, t)$, defined so that the total mass in a region $V$ is

$$
m = \int_V \rho(\mathbf{r}, t)\, dV.
$$

Matter is distinguished from massless fields (such as electromagnetic radiation in vacuum) by satisfying $\rho > 0$ almost everywhere in its occupied domain, and by obeying conservation of mass, expressed locally via the continuity equation.

**Worked example.** Consider a thin rod of length $L$ with linear mass density $\lambda(x) = \lambda_0\left(1 + \dfrac{x}{L}\right)$ for $x \in [0, L]$. The total mass is

$$
m = \int_0^L \lambda_0\left(1 + \frac{x}{L}\right) dx = \lambda_0\left[x + \frac{x^2}{2L}\right]_0^L = \frac{3}{2}\lambda_0 L.
$$

This illustrates how the abstract definition of matter as mass-bearing substance reduces to an integral computation once a density function is specified.

**Key theorem (Conservation of Mass).** For a closed system with no mass flux across its boundary $\partial V$, the total mass is conserved:

$$
\frac{d}{dt}\int_V \rho\, dV = -\oint_{\partial V} \rho\, \mathbf{v}\cdot \mathbf{n}\, dA = 0,
$$

which follows from the divergence theorem applied to the continuity equation $\partial_t \rho + \nabla\cdot(\rho\mathbf{v}) = 0$.

**Lab cell (SymPy).**
```python
import sympy as sp

x, L, lam0 = sp.symbols('x L lambda_0', positive=True)
lam = lam0 * (1 + x/L)
mass = sp.integrate(lam, (x, 0, L))
print(sp.simplify(mass))  # 3*L*lambda_0/2
```

---

## Pure Substance

**Definition.** A pure substance is a system composed of a single chemical species, exhibiting uniform and invariant chemical composition throughout its mass, whether it exists in one phase or coexists in several. Formally, if $N$ denotes the total number of moles and $N_i$ the moles of chemical component $i$, a pure substance satisfies $N_i = N$ for exactly one $i$, and $N_j = 0$ for all $j \neq i$. Crucially, a pure substance need not be chemically homogeneous in phase: liquid water in equilibrium with its vapor is a pure substance, since both phases consist entirely of $\mathrm{H_2O}$ molecules, even though they differ in molar volume and density.

**Worked example.** Consider a rigid, sealed container holding $2\ \text{kg}$ of water at $100^\circ\text{C}$ and $1\ \text{atm}$, existing partly as liquid and partly as vapor. Although two phases are present, the system is a pure substance because its chemical composition is uniform: every parcel of matter, liquid or vapor, is $\mathrm{H_2O}$. If instead the container held a mixture of liquid water and liquid oil, the system would *not* be pure, despite being single-phase in appearance, since the composition varies with the identity of the molecular species present.

**Key theorem (Gibbs Phase Rule specialization).** For a pure substance ($C = 1$ component), the Gibbs phase rule,
$$
F = C - P + 2,
$$
reduces to $F = 3 - P$, where $F$ is the number of independent intensive variables (degrees of freedom) and $P$ is the number of coexisting phases. Consequently, a single-phase pure substance has $F = 2$ (e.g., $T$ and $v$ fix the state), while a two-phase mixture has $F = 1$ (temperature alone fixes the saturation pressure and vice versa).

**Lab cell (SymPy).**
```python
import sympy as sp

C, P, F = sp.symbols('C P F', positive=True, integer=True)
gibbs_rule = sp.Eq(F, C - P + 2)

pure_single_phase = gibbs_rule.subs({C: 1, P: 1})
pure_two_phase = gibbs_rule.subs({C: 1, P: 2})

print(sp.simplify(pure_single_phase))
print(sp.simplify(pure_two_phase))
```

---

## Payoff

The concept of a **pure substance** is the point at which thermodynamics stops describing an abstraction and begins describing a specific piece of matter you can hold, heat, or compress. A pure substance is defined as matter with homogeneous and invariant chemical composition, regardless of phase: liquid water, ice, and steam are each pure substances, and so is a mixture of the two coexisting in equilibrium, since the chemical formula $\mathrm{H_2O}$ does not change across phases. What makes this concept the natural endpoint of the chapter is that it is precisely the object for which the state postulate holds: for a simple compressible pure substance, exactly two independent intensive properties fix the entire equilibrium state. Formally, if $\rho$ denotes the density of independent, intensive property pairs needed to specify state, then for a simple compressible substance $\rho = 2$, so that any third property $z$ is a function $z = z(x,y)$ of any two independent properties $x, y$ (for example, $z=z(T,P)$ or $z=z(T,v)$).

This closure is what allows every result developed earlier — equations of state, $P$–$v$–$T$ surfaces, phase diagrams, the ideal gas law as a limiting case — to be organized into a single coherent framework: they are all statements about functions on the state space of a pure substance. The worked example is immediate: for water at $T = 100^\circ\mathrm{C}$ and $P = 1\ \mathrm{atm}$, knowing these two properties alone determines that the system lies on the saturation line, fixing $v_f$, $v_g$, $u$, $h$, and $s$ for both phases from tabulated data, with no further information required.

This is why pure_substance underlies every downstream application: power cycles (Rankine, Brayton) track a working fluid — water or air treated as a pure substance — through phase change and compression; refrigeration cycles exploit the latent heat of a pure refrigerant during evaporation and condensation; and combustion analysis models fuel and products as pure or pseudo-pure substances to apply energy balances rigorously. In each case, the same two-property closure lets you read enthalpy, entropy, and specific volume from a table or an equation of state instead of solving the underlying molecular problem from scratch.

**Lab cell (SymPy).**
```python
from sympy import symbols, Function, diff, Eq

T, P, v = symbols('T P v', positive=True)
z = Function('z')(T, P)  # any property expressed via two independents
dz = diff(z, T)*symbols('dT') + diff(z, P)*symbols('dP')
print(Eq(symbols('dz'), dz))
```

From here, the invitation is direct: pick one application — say, the Rankine cycle — and trace a working fluid of water through evaporator, turbine, condenser, and pump, using only $T$–$s$ and $P$–$v$ property tables for a pure substance to compute the cycle's thermal efficiency.
```
