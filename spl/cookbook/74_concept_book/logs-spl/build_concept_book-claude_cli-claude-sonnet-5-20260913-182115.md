# SPL Run: build_concept_book

- **Adapter:** claude_cli
- **Model:** claude-sonnet-5
- **Tokens:** 903 in / 982 out
- **Latency:** 30960ms
- **Timestamp:** 2026-09-13 18:21:15

## Output

```output


---

## Atom

An **atom** is the smallest unit of an element that retains the chemical identity of that element. Each atom consists of a dense, positively charged nucleus, built from protons and neutrons, surrounded by a diffuse cloud of negatively charged electrons. The number of protons fixes which element the atom belongs to, and a neutral atom always carries an equal number of electrons. (The formal notation for proton count, neutron count, and isotopes is introduced in the following section; here we use plain particle counts.)

**Worked example.** Consider an atom of chlorine with 17 protons, 18 neutrons, and, since it is neutral, 17 electrons. Its total particle count in the nucleus is
$$
17 + 18 = 35,
$$
matching the familiar label "chlorine-35." This single number packages the proton and neutron counts together but does not by itself tell us how many of each are present — that decomposition is exactly what the atomic model must supply.

**Key theorem (particle-count relation).** For any atom, the number of nuclear particles equals the sum of its protons and neutrons:
$$
p + n = \text{(nucleon count)},
$$
where $p$ is the proton count and $n$ is the neutron count. Because protons and neutrons have nearly identical mass, each about 1 atomic mass unit, while an electron's mass is roughly 1/1800 of this, the atom's mass is well approximated by
$$
m_{\text{atom}} \approx (p + n)\cdot 1\ \text{u},
$$
neglecting electron mass and nuclear binding-energy corrections.

**Lab cell (SymPy).**
```python
from sympy import symbols, Eq, solve

p, n, nucleons = symbols('p n nucleons', positive=True, integer=True)
relation = Eq(nucleons, p + n)

# Chlorine atom: 17 protons, 35 nucleons total; solve for neutrons
solution = solve(relation.subs({nucleons: 35, p: 17}), n)
print("Neutrons in this chlorine atom:", solution)  # [18]

# Verify the nucleon-count identity symbolically
print("Symbolic nucleon count =", p + n)
```

This exercise establishes only the single new idea needed at this stage — that an atom's identity rests on proton, neutron, and electron counts — and sets up the notation and terminology (atomic number, mass number, isotopes) developed in the next section.
```
