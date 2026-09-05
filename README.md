# Çanakkale 1915 — Cinematic WebGL Memorial

> **Build by Opus 5.**

A single-file, dependency-free (CDN ES modules only) **Three.js r169** scene themed on the
**Battle of Gallipoli / Çanakkale Savaşı, 1915**. Everything you see is generated in code —
no meshes, no textures, no model files.

**▶ Live:** open `index.html`, or enable GitHub Pages on `main` → `/`

---

## What is in the scene

| Layer | Implementation |
|---|---|
| **Terrain** | `PlaneGeometry(3000, 3000, 400, 400)` displaced on the CPU by a custom deterministic value-noise **fBm + ridged-fBm** height field. A noise-perturbed coastline, an abrupt cliff face, plateaus, spurs and gullies. Per-vertex colouring blends deep shelf → sand → dry scrub → exposed rock by height *and* slope. |
| **Sea (Dardanelles)** | Custom `ShaderMaterial` with **4 summed Gerstner waves**, analytic tangent/binormal normals, Fresnel depth blending, a sharp sun-glitter specular path and wind-torn crest foam. Displacement is computed in **world space**, so the tile is re-centred under the camera every frame without any phase pop. |
| **Lighting** | Low dawn `DirectionalLight` (2048² PCF-soft shadow map), warm `HemisphereLight`, cool blue rim light, ambient bounce, ACES filmic tone mapping. |
| **Fog** | `THREE.FogExp2` for battle smoke. The sea shader reproduces the *exact* FogExp2 metric (`-mvPosition.z`), so custom and built-in fog stay perfectly matched. |
| **Memorial** | Procedural **Çanakkale Şehitleri Abidesi**: stepped podium, four pylons, massive lintel, sarcophagus, inscription plaque, and a flagpole whose banner is animated by a cheap per-vertex sine cloth. |
| **Fort** | A curved bastion line with crenellations and coastal guns, laid onto the real terrain height along the cliff shoulder. |
| **Trenches** | 260 sandbags as a single `InstancedMesh` + shattered trees, height-filtered so nothing floats or drowns. |
| **Fleet** | 5 low-poly pre-dreadnoughts (extruded tapered hull, superstructure, funnels, masts, turrets with twin barrels, casemates), each bobbing with its own phase and trailing a wake. |
| **Particles** | Three systems: 900 ambient **smoke** points, 1400 additive **dust/ember** motes, and a pooled **artillery flash** (burst sprite + shockwave ring + rising smoke puff + point light). |
| **Camera** | A `CatmullRomCurve3` **dolly + separate look-at spline**, ping-ponging from the open Aegean across the fleet up to the Memorial, with eased velocity, hand-held micro-drift, quaternion-safe bank and a breathing focal length. `OrbitControls` is the fallback. |
| **Post** | `EffectComposer` → `RenderPass` → `UnrealBloomPass` → `OutputPass`, with an automatic fallback to direct rendering if post-processing fails to load. |

## Controls

| Input | Action |
|---|---|
| `C` / **Sinematik Kamera** | Toggle cinematic dolly ⇄ free OrbitControls |
| `F` / **Topçu Atışı** | Fire an artillery shell |
| `G` / **Savaş Dumanı** | Toggle the heavy fog layer |
| **Kalite** | High / Balanced / Performance (pixel ratio, shadows, bloom) |
| Drag / wheel / pinch | Orbit, zoom (free-camera mode) |

## Engineering notes

- **Boot cost.** The height field is evaluated **exactly once per vertex** into a cached
  `Float32Array` grid; slope is then taken from grid neighbours by central differences.
  This removed 4 of 5 fBm evaluations per vertex and cut terrain build from **≈495 ms to ≈100 ms**.
- **Shadow swimming.** The directional light rig follows the camera target but is **snapped to a
  world grid the size of a shadow texel**, so the shadows do not crawl while the dolly moves.
- **Tone mapping.** Custom shaders include `<tonemapping_fragment>` / `<colorspace_fragment>`.
  Three.js disables in-shader tone mapping when drawing into a render target, so the composer path
  tone-maps once, in `OutputPass` — no double application in either path.
- **Accessibility & resilience.** `prefers-reduced-motion` starts the scene in a static, orbit-only
  framing; the canvas is focusable and labelled; rendering pauses on tab blur; `webglcontextlost`
  is handled; `resize` and `orientationchange` are both wired.

## Stack

- Three.js `0.169.0` via `importmap` (unpkg) — no build step, no `node_modules`.
- Plain HTML + CSS + ES modules. Open the file and it runs.

## License

MIT — see [LICENSE](LICENSE). Code only; the historical subject matter is the shared heritage it honours.
