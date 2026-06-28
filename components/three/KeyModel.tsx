'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  type Group,
  type Texture,
  Path,
  Shape,
  RepeatWrapping,
} from 'three';
import { PALETTE } from '@/lib/palette';

/**
 * A procedural, photoreal-ish brass key — built OFFLINE from a single beveled
 * silhouette so it loads instantly with zero external assets (the prior
 * CDN-asset prototype failed because the model/three never loaded).
 *
 * Design: an elegant flat estate / fine-hotel key. The whole profile — round
 * bow with a teardrop opening, a tapered neck, a slender shank, and a cut bit —
 * is ONE `THREE.Shape` extruded with a small bevel, so every edge is filleted
 * and catches light. Sharp primitive edges were the main "cheap" tell; the
 * bevel + a lathe-turned collar fixes that. A lathe collar wraps the neck for
 * that classic turned detail, and the brand initial is INCISED into the bow via
 * a bump/roughness CanvasTexture (not a pasted decal). Stays name-agnostic —
 * `initial` is passed in from BRAND.
 *
 * Orientation: modelled in the XY plane (bow up at +Y, bit down at -Y), thin in
 * Z. KeyCanvas/KeyReveal place and turn it; turning about the key's long axis
 * (its local Y here, rotated into world X) reads as a key in a lock.
 *
 * Brass = MeshPhysicalMaterial: metalness 1, low roughness, a faint clearcoat
 * and roughness variation so it reads as cast metal, not a flat gold blob.
 * Color matched to --accent (#a8843e), lit by the inline Lightformer
 * Environment in KeyCanvas.
 */

// Single source of truth shared with --accent (remediation #13).
const BRASS = new Color(PALETTE.brass);

/* ------------------------------------------------------------------ */
/* Geometry — the flat key silhouette                                  */
/* ------------------------------------------------------------------ */

// Key proportions (local units; ~3.1 tall overall). Tuned to read as an
// antique estate key: a generous round bow, a slim waisted neck, a clean shank,
// and a single well-cut bit near the tip.
const BOW_CENTER_Y = 1.12;
const BOW_OUTER = 0.62;
const BOW_INNER = 0.34; // the opening you'd thread a ring through
const NECK_TOP_Y = BOW_CENTER_Y - BOW_OUTER + 0.04;
const SHANK_HALF_W = 0.085;
const SHANK_BOTTOM_Y = -1.18;
const BIT_TOP_Y = -0.62;

/** The outer key profile as a closed Shape, with the bow opening as a hole. */
function buildKeyShape(): Shape {
  const s = new Shape();

  // Start at the top of the neck on the right side, walk DOWN the right edge of
  // the shank, around the bit, up the left edge, then close around the bow.
  const x = SHANK_HALF_W;

  // right side of neck/shank (top → down)
  s.moveTo(x, NECK_TOP_Y);
  // gentle waist into the shank
  s.quadraticCurveTo(x + 0.06, NECK_TOP_Y - 0.18, x, NECK_TOP_Y - 0.36);
  s.lineTo(x, BIT_TOP_Y + 0.02);

  // ---- the bit (wards) on the RIGHT side, cut like a real key ----
  // finer, two-step ward cut — slimmer than the old chunky block so it reads as
  // a forged estate key rather than a graphic toy key.
  s.lineTo(0.27, BIT_TOP_Y);
  s.lineTo(0.27, BIT_TOP_Y - 0.1);
  // first ward notch
  s.lineTo(0.17, BIT_TOP_Y - 0.1);
  s.lineTo(0.17, BIT_TOP_Y - 0.2);
  s.lineTo(0.31, BIT_TOP_Y - 0.2);
  s.lineTo(0.31, BIT_TOP_Y - 0.3);
  // second, smaller ward notch
  s.lineTo(0.17, BIT_TOP_Y - 0.3);
  s.lineTo(0.17, BIT_TOP_Y - 0.4);
  s.lineTo(0.26, BIT_TOP_Y - 0.4);
  s.lineTo(0.26, BIT_TOP_Y - 0.5);
  // step back to the shank width for the tip
  s.lineTo(x, BIT_TOP_Y - 0.5);

  // rounded tip across the bottom
  s.lineTo(x, SHANK_BOTTOM_Y + 0.06);
  s.quadraticCurveTo(0, SHANK_BOTTOM_Y, -x, SHANK_BOTTOM_Y + 0.06);

  // left edge of shank back up to the neck
  s.lineTo(-x, NECK_TOP_Y - 0.36);
  s.quadraticCurveTo(-x - 0.06, NECK_TOP_Y - 0.18, -x, NECK_TOP_Y);

  // ---- the bow: a full round head joined to the neck ----
  // sweep from the left of the neck, around the top, back to the right.
  s.absarc(0, BOW_CENTER_Y, BOW_OUTER, Math.PI * 1.18, Math.PI * -0.18, true);
  s.closePath();

  // bow opening (teardrop-ish round hole)
  const hole = new Path();
  hole.absarc(0, BOW_CENTER_Y + 0.04, BOW_INNER, 0, Math.PI * 2, false);
  s.holes.push(hole);

  return s;
}

function useKeyGeometry(): ExtrudeGeometry {
  return useMemo(() => {
    const shape = buildKeyShape();
    const geo = new ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.022,
      bevelSize: 0.018,
      bevelSegments: 3,
      curveSegments: 64,
    });
    // center the extrusion in Z so the key is symmetric front/back
    geo.translate(0, 0, -0.08);
    geo.computeVertexNormals();
    return geo;
  }, []);
}

/* ------------------------------------------------------------------ */
/* Engraving — incised brand initial on the bow                        */
/* ------------------------------------------------------------------ */

/**
 * A bump + roughness map for the engraved initial. Mid-grey field = flat
 * polished brass; the letter is drawn darker (recessed in the bump map) and
 * slightly rougher, so it reads as INCISED metal that only catches light at its
 * edges — a tasteful engraving, not a decal. Mapped onto a thin disc set into
 * the bow face.
 */
function useEngraving(initial: string): { bump: Texture; rough: Texture } {
  return useMemo(() => {
    const size = 512;

    const make = (draw: (ctx: CanvasRenderingContext2D) => void): Texture => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      draw(ctx);
      const tex = new CanvasTexture(canvas);
      tex.anisotropy = 8;
      tex.wrapS = tex.wrapT = RepeatWrapping;
      return tex;
    };

    const letter = (ctx: CanvasRenderingContext2D, fill: string, bg: string) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = fill;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // a fine serif at a tasteful size — engraved, centered, legible head-on
      ctx.font = `500 ${size * 0.46}px Georgia, "Times New Roman", serif`;
      ctx.fillText(initial, size / 2, size * 0.53);
    };

    // bump: white = raised, black = recessed → engrave the letter dark with a
    // soft blurred edge so the groove has a believable wall.
    const bump = make((ctx) => {
      letter(ctx, '#bdbdbd', '#dadada'); // bright polished field
      ctx.filter = 'blur(1.5px)';
      letter(ctx, '#1e1e1e', 'transparent'); // deep groove with a crisp wall
      ctx.filter = 'none';
    });

    // roughness: a satin field (bright = rough) so the disc reads as brushed
    // brass, not a mirror — a dark field here multiplied roughness down to a
    // near-mirror that reflected the empty hemisphere as a black pool (#1). The
    // incised groove is a touch rougher still than the polished field.
    const rough = make((ctx) => {
      letter(ctx, '#e0e0e0', '#c2c2c2');
    });

    return { bump, rough };
  }, [initial]);
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function KeyModel({
  initial,
  groupRef,
}: {
  initial: string;
  groupRef: React.RefObject<Group>;
}) {
  const idle = useRef<Group>(null);
  const geo = useKeyGeometry();
  const { bump, rough } = useEngraving(initial);

  // gentle idle breathing/sway so the still frame is never dead
  useFrame((state) => {
    if (!idle.current) return;
    const t = state.clock.elapsedTime;
    idle.current.position.y = Math.sin(t * 0.6) * 0.035;
    idle.current.rotation.z = Math.sin(t * 0.45) * 0.022;
  });

  return (
    // outer group: scroll-driven turn + camera-relative placement happen on the
    // parent in KeyCanvas; this group only carries idle micro-motion.
    <group ref={groupRef}>
      <group ref={idle}>
        {/* A slight tilt gives specular life across the flat faces. */}
        <group rotation={[0.12, -0.18, 0]}>
          {/* ---- the key body: one beveled extruded silhouette ---- */}
          <mesh geometry={geo} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={BRASS}
              metalness={1}
              roughness={0.22}
              clearcoat={0.25}
              clearcoatRoughness={0.18}
              reflectivity={0.6}
              envMapIntensity={1.35}
            />
          </mesh>

          {/* ---- incised brand initial, set just proud of the bow face ---- */}
          <mesh position={[0, BOW_CENTER_Y + 0.04, 0.081]}>
            <circleGeometry args={[BOW_INNER - 0.015, 64]} />
            <meshPhysicalMaterial
              color={BRASS}
              metalness={1}
              roughness={0.32}
              roughnessMap={rough}
              bumpMap={bump}
              bumpScale={1.6}
              clearcoat={0.25}
              clearcoatRoughness={0.2}
              envMapIntensity={1.35}
            />
          </mesh>
          {/* mirror on the back so the bow opening reads as solid from behind */}
          <mesh
            position={[0, BOW_CENTER_Y + 0.04, -0.081]}
            rotation={[0, Math.PI, 0]}
          >
            <circleGeometry args={[BOW_INNER - 0.015, 64]} />
            <meshPhysicalMaterial
              color={BRASS}
              metalness={1}
              roughness={0.32}
              roughnessMap={rough}
              bumpMap={bump}
              bumpScale={1.6}
              clearcoat={0.25}
              envMapIntensity={1.35}
            />
          </mesh>

          {/* ---- turned collar wrapping the neck (classic key detail) ---- */}
          {/* a short lathe-like torus pair gives the neck a machined ring that
              reads beautifully under the rim light */}
          <mesh position={[0, NECK_TOP_Y - 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.135, 0.05, 24, 64]} />
            <meshPhysicalMaterial
              color={BRASS}
              metalness={1}
              roughness={0.18}
              clearcoat={0.25}
              clearcoatRoughness={0.2}
              envMapIntensity={1.4}
            />
          </mesh>
          <mesh
            position={[0, NECK_TOP_Y - 0.34, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.115, 0.032, 20, 56]} />
            <meshPhysicalMaterial
              color={BRASS}
              metalness={1}
              roughness={0.2}
              clearcoat={0.25}
              envMapIntensity={1.4}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
