# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 1842 in / 2584 out
- **Latency:** 53866ms
- **Timestamp:** 2026-09-13 17:33:46

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

## Physical Property

**Definition.** A *physical property* is a real-valued function $Q$ that assigns to a physical system a numerical value, expressed in a chosen unit system, which can in principle be measured or derived from measurement without altering the chemical identity of the system. If a system's condition is described by measurable quantities such as mass, volume, and temperature, a physical property is any well-defined function $Q$ of those quantities.

**Worked example.** Consider a sample of gas of mass $m$ occupying volume $V$ at temperature $T$. Density $\rho = m/V$ is a physical property: it is measurable (via mass and volume determinations), it does not depend on how much gas you happen to have sampled (it is *intensive*), and it transforms consistently under unit changes, e.g., $\rho\,[\mathrm{kg/m^3}] = 1000\,\rho\,[\mathrm{g/cm^3}]$. Contrast this with mass $m$ itself, an *extensive* property that scales with system size.

**Key theorem (Intensive–Extensive Decomposition).** Every physical property $Q$ of a homogeneous system can be classified as extensive or intensive: $Q$ is extensive if $Q(\lambda S) = \lambda\, Q(S)$ for all scaling factors $\lambda > 0$ (where $\lambda S$ denotes $\lambda$ copies of the system), and intensive if $Q(\lambda S) = Q(S)$. Any extensive property $Q$ can be converted to an intensive one by dividing by another extensive property, typically mass or volume, e.g., $\rho = m/V$.

*Proof sketch.* Partition the homogeneous system into $\lambda$ identical subsystems. Extensive quantities (mass, volume, internal energy) sum additively across subsystems, giving the scaling law $Q(\lambda S) = \lambda Q(S)$. Intensive quantities (density, temperature, pressure) are determined locally and are unaffected by the number of subsystems, yielding $Q(\lambda S) = Q(S)$. $\blacksquare$

**Lab cell (SymPy).**
```python
import sympy as sp

m, V, lam = sp.symbols('m V lambda', positive=True)
rho = m / V

rho_scaled = rho.subs({m: lam*m, V: lam*V})
print(sp.simplify(rho_scaled - rho))  # 0  -> confirms rho is intensive
```

---

## Intensive Property

**Definition.** A physical property $P$ of a thermodynamic system is called *intensive* if its value does not depend on the extent (size or mass) of the system. Formally, suppose a homogeneous system is partitioned into two subsystems with masses $m_1$ and $m_2$, each in the same thermodynamic state as the whole. If $P$ satisfies
$$
P(\lambda \, m) = P(m), \qquad \lambda > 0,
$$
then $P$ is intensive. This contrasts with an *extensive* property $E$, which scales linearly with system size, $E(\lambda m) = \lambda\, E(m)$. Common intensive properties include temperature $T$, pressure $p$, density $\rho$, and specific quantities such as molar volume $\bar v = V/n$.

**Worked example.** Consider a container of water at uniform temperature $T = 25^{\circ}\text{C}$ and density $\rho = 997\ \text{kg/m}^3$. If the container is divided into two equal halves, each half still has $T = 25^{\circ}\text{C}$ and $\rho = 997\ \text{kg/m}^3$ — these values are unchanged by halving the mass. In contrast, the total volume $V$ and total mass $m$ are each halved, confirming that $V$ and $m$ are extensive while $T$ and $\rho$ are intensive.

**Key theorem.** If $E$ is an extensive property that is a homogeneous function of degree 1 in the extensive variables $\{n_i\}$ (mole numbers) at fixed intensive variables, Euler's theorem gives
$$
E(n_1, \dots, n_k) = \sum_{i=1}^{k} n_i \left(\frac{\partial E}{\partial n_i}\right)_{T,p,n_{j\neq i}},
$$
where each partial molar derivative $\bar{e}_i = \left(\partial E/\partial n_i\right)$ is itself intensive. This identity underlies the definition of chemical potential and partial molar quantities in chemical thermodynamics.

**Lab cell (SymPy).**
```python
import sympy as sp

n, V_m = sp.symbols('n V_m', positive=True)   # V_m: molar volume (intensive)
V = n * V_m                                    # total volume (extensive)

lam = sp.symbols('lambda', positive=True)
scaled = V.subs(n, lam*n)
print(sp.simplify(scaled / V))                 # -> lambda, confirms V is extensive
print(sp.simplify(V_m.subs(n, lam*n) / V_m))   # -> 1, confirms V_m is intensive
```

---

## Payoff

An intensive property is a quantity that does not depend on the extent, or size, of a system: it retains the same value when the system is partitioned into smaller pieces, provided those pieces remain in the same state. Formally, if $X$ is a property of a system $S$ and $S$ is decomposed into subsystems $S_1, S_2, \ldots, S_n$ with $S = \bigcup_i S_i$, then $X$ is intensive if
$$
X(S_i) = X(S) \quad \text{for every subsystem } S_i,
$$
whereas an extensive property $Y$ satisfies $Y(S) = \sum_i Y(S_i)$. This distinction is the natural endpoint of the concept-book because every quantitative model we have built — measures, densities, ratios, rates — ultimately separates into these two behaviors, and intensive properties are what allow local measurement to stand in for global truth.

**Worked example.** Consider a homogeneous rod of mass $m$, length $L$, and uniform density $\rho = m/L$. Cutting the rod in half yields two rods of mass $m/2$ and length $L/2$, but each half still has density $(m/2)/(L/2) = \rho$. Mass and length are extensive; density is intensive.

**Key theorem.** *If $Y_1$ and $Y_2$ are extensive properties of a system with $Y_2 \neq 0$ on every subsystem, then $X = Y_1/Y_2$ is intensive.* The proof is immediate: on subsystem $S_i$, $X(S_i) = Y_1(S_i)/Y_2(S_i)$, and while individual $Y_1(S_i), Y_2(S_i)$ vary with subsystem size, their ratio is invariant precisely when the underlying state is homogeneous — the ratio cancels the scale dependence that made $Y_1$ and $Y_2$ extensive in the first place.

```python
from sympy import symbols, simplify

m, L, k = symbols('m L k', positive=True)
rho = m / L
rho_half = (m/k) / (L/k)   # subsystem scaled by factor 1/k
print(simplify(rho_half - rho))  # 0: density is scale-invariant
```

This single idea — that dividing two extensive quantities produces a scale-free invariant — is the mechanism behind pressure, concentration, temperature, and unit price alike. Readers are invited to pursue one such application next and trace how the intensive property built here reappears as the stable, comparable quantity beneath a system's changing size.
```
