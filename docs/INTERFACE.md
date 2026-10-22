# The Chinese study garden

The home screen uses an editorial headline, an original miniature garden,
contour-like ink lines, a cinnabar seal, carved Hanzi details, and a varied HSK
path. The next learning action stays beside the headline. Real profile statistics
appear in a separate strip, and vocabulary keeps its pronunciation and audio.
Dictionary, grammar, and exercise reading surfaces remain restrained and legible.

`LearningGarden.tsx` lazy-loads `garden-renderer.ts`. The renderer uses Three.js
0.186.1 with a pavilion, curved roof eaves, moon gate, pond, bridge, bamboo,
sculpted pine trees, and study steles. Geometry and glyph textures are authored
locally; no remote models, catalog imagery, or image requests are required.
The dimensional composition and visibility lifecycle are informed by the
[ThreeUI Community reference](https://github.com/MengTo/threeui/tree/68802d5428071ada5c20db8094b1649e6bb770ed).
The garden is an original scene, not a reproduction of a catalog component.
Three.js has its own MIT notice in `three-LICENSE.txt`.

Static meshes are merged by material while the inscriptions and moving cloud
remain separate. The measured scene uses 37 draw calls and 58,982 rendered
triangles, including its shadow pass. Rendering targets 30 fps, caps DPR at 1.75,
and limits the drawing buffer to about 1.6 million pixels. These are adaptive
rendering choices, not a 4K claim. DOM typography remains at native sharpness.

The host pauses when hidden or offscreen, renders a still view for reduced
motion, and ignores touch movement to preserve scrolling. Pointer movement
changes the garden's viewing angle. A vector illustration remains available
while loading or if WebGL fails. Context restoration schedules a fresh frame.
All observers, event handlers, animation frames, geometries, materials, textures,
shadow maps, and renderer resources are released on unmount.

`garden-theme.css` styles the home composition and brand, while `study-theme.css`
retains the previous reading-surface and responsive fixes. The mobile layout
places the learning action before the illustration. Both English and Vietnamese
headlines are fitted independently. Decorative Hanzi and the canvas are hidden
from assistive technology; navigation and study actions remain normal controls.

# English editorial layer

`reviewed.en.json` contains deliberate wording corrections for shared HSK
guidance, conversation scenarios, lesson names, audio errors, reading passages,
and interface labels. These survive regeneration of the older translation
catalog. Reviewed exact entries win first; specific reviewed templates can
replace stale generated full sentences. Broad legacy templates cannot override
known labels such as “HSK 1 lessons”.

`counts.ts` formats counts and singular/plural wording for the home, review,
dictionary, and navigation. The original lesson IDs, answers, Chinese text,
pinyin, personal names, and learner input stay intact.

Run `npm run test:english-ui` for UI-literal coverage (including accents shared
with pinyin), translation precedence, count boundaries, and HSK guidance
regressions. Linguistic quality of every imported dictionary sense or advanced
draft is not certified by these technical checks.
