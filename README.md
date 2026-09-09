<p align="center">
  <img src="https://github.com/user-attachments/assets/fd039e72-f0c9-4de3-a92c-271186eeef54" alt="Canakkale 1915: the Strait at dawn, the fleet and the Martyrs' Memorial" width="900">
</p>

<h1 align="center">Canakkale 1915</h1>

<p align="center">
  A cinematic commemorative scene over the Strait at dawn.<br>
  It opens in the browser. Not one model, texture or photograph file is used. Everything you see is generated in code.
</p>

<p align="center">
  <a href="https://umutseve4.github.io/canakkale-1915-webgl/"><img src="https://img.shields.io/badge/live-demo-FF4D4F?style=flat-square" alt="Live demo"></a>
  <img src="https://img.shields.io/badge/model%20files-0-FF4D4F?style=flat-square" alt="Zero model files">
  <img src="https://img.shields.io/badge/terrain%20build-100%20ms-FF4D4F?style=flat-square" alt="Terrain build 100 ms">
</p>

<p align="center"><b><a href="https://umutseve4.github.io/canakkale-1915-webgl/">Open the scene</a></b></p>

---

## What happens in the first 30 seconds

The camera starts out over the open Aegean, passes across the waves, moves in between the ships of the fleet, climbs the shore and comes to rest at the Martyrs' Memorial. The sea really does move: four Gerstner waves are stacked on top of each other, the sun breaks on their crests, and the wind carries the foam. The fog is heavy, and there are sandbags and broken trees in the trenches. Press `F` and a gun fires: a flash, a shock ring, rising smoke and a real light source.

| Input | Effect |
|---|---|
| `C` | Cinematic camera and free flight, toggled |
| `F` | Artillery shot |
| `G` | Battle smoke on or off |
| Drag, wheel | Orbit and zoom (in free mode) |
| Quality button | High / Balanced / Performance |

## What is in the scene

| Layer | How it is made |
|---|---|
| **Terrain** | A 400x400 subdivided plane, displaced on the CPU by deterministic value noise (fBm plus ridged fBm). A noise broken coastline, a steep slope, a plateau, a ridge and stream beds. Colour blends by height *and* by slope: shelf, sand, dry scrub, bare rock. |
| **Sea** | Four Gerstner waves, analytic tangent and binormal normals, a Fresnel depth blend, a sharp sun glint, wind foam. The displacement is computed **in world space**, so the tile is recentred under the camera every frame with no phase jump. |
| **Memorial** | A procedural Canakkale Martyrs' Memorial: a stepped base, four legs, the lintel, the sarcophagus, the inscription and a flag rippling on a sine wave. |
| **Battery** | A curved rampart line with coastal guns and embrasures, seated on the real terrain height. |
| **Trenches** | 260 sandbags inside a single `InstancedMesh`, filtered by height, none of them floating in the air or sunk into the ground. |
| **Fleet** | 5 low polygon battleships: a tapering hull, superstructure, funnels, masts, twin barrelled turrets. Each rolls on its own phase and leaves a wake behind it. |
| **Particles** | 900 smoke points, 1400 dust and spark motes, a pooled artillery flash. |
| **Camera** | A `CatmullRomCurve3` dolly plus a separate look curve; smoothed speed, handheld shake, quaternion safe roll, a breathing focal length. |

## How to run it

For the live version, [click here](https://umutseve4.github.io/canakkale-1915-webgl/). To run it locally, download `index.html` and double click it. No build, no `npm install`, no server.

## Engineering notes

**The opening cost came down.** The height field is evaluated **exactly once** per vertex and written into a `Float32Array` grid; the slope is then taken as a central difference from neighbouring cells. That removed 4 of the 5 fBm calls per vertex and brought the terrain build from ~495 ms down to ~100 ms.

**Shadows do not swim.** The directional light follows the camera, but **a shadow texel is locked to a world grid of one texel in size**, so the shadows do not crawl while the dolly moves.

**The fog is the same in two places.** The `FogExp2` metric (`-mvPosition.z`) is reproduced exactly inside the sea shader, so the custom shader and the built in fog do not separate from each other.

**Tone mapping is applied once.** Three.js turns off in shader tone mapping when it draws into a render target, so on the composer path tone mapping happens only in `OutputPass`. Neither path applies it twice.

**Against fragility.** If `prefers-reduced-motion` is set the scene starts still; the canvas is focusable and labelled; rendering stops when the tab goes to the background; `webglcontextlost` is caught; if post processing fails to load, it falls back to direct rendering.

Dependency: Three.js `0.169.0`, from a CDN through an `importmap`. No build step, no `node_modules`.

## How it is verified

The scene needs a GPU, so CI cannot open it and cannot measure a frame rate. What CI does check, through `verify.mjs`, is everything that can be checked without one:

```
node verify.mjs
```

- the document declares `lang`, a title and a viewport, handles `prefers-reduced-motion`, catches `webglcontextlost`, and keeps the canvas focusable and labelled
- every resource the browser actually loads comes from an allowed CDN, and no model, texture, photograph or video file is referenced at all, which is what makes the "0 model files" badge a measured claim rather than a slogan
- three is pinned to exactly one version in the importmap, and **the README names that same version**, so this section cannot go stale on its own
- the module script parses, and no `debugger` or `alert` was left behind
- the terrain build figure is the same number in all three places it appears in this README, and no frame rate figure is published anywhere, because none was measured

## Limits

- This is a commemorative scene, not a historical reconstruction. The ships, the battery and the terrain were designed in the *order of magnitude* of the period. No specific ship or specific position is modelled.
- Three.js comes from a CDN, so the first load needs an internet connection.
- The quality tier drops on mobile; this was designed for a wide screen.
- The terrain build time (from ~495 ms to ~100 ms) was measured on a single desktop machine, in Chrome, with `performance.now()`. It varies from device to device. It is a before and after measurement on the same machine, not an independent benchmark.
- The frame rate was not measured, which is why no frame rate figure is given anywhere.

## Twin repository

[`gallipoli-1915-webgl`](https://github.com/umutseve4/gallipoli-1915-webgl) ([live](https://umutseve4.github.io/gallipoli-1915-webgl/)) is a **second, independent reading** of the same subject. Not an accident, not a fork. Both stay up because they part company in the places that matter:

| | `canakkale-1915-webgl` (here) | `gallipoli-1915-webgl` |
|---|---|---|
| Engine | Three.js **r169** | Three.js **0.167.1** |
| Sea | 4 Gerstner waves, world space | 3 summed sines, derivative normals |
| Post processing | `EffectComposer` plus bloom | none, direct render |
| Framing | a memorial centred cinematic dolly | a wide battle scene plus a HUD clock |
| Signature | Build by Opus 5 | Build by GPT 5.6 |

If you want to compare them, look at the sea shader and the camera rig first. That is where the two readings actually diverge.

---

MIT licensed, see [LICENSE](LICENSE). That covers the code; the subject itself is the shared heritage it honours. &nbsp;·&nbsp; Build by **Opus 5**.
