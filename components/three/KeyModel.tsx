'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  Box3,
  type Group,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  Vector3,
} from 'three';

/**
 * The hero brass key — a real modelled GLTF (`/assets/key.glb`, DRACO + webp
 * compressed, ~410KB) replacing the earlier procedural silhouette. The mesh
 * keeps its OWN baked maps (diffuse / normal / metallic-roughness); we only
 * convert its material Standard→Physical to gain a clearcoat and lift the
 * reflections so aged brass reads as glossy metal under the Lightformer
 * environment in KeyCanvas — not a flat matte casting.
 *
 * DRACO decoder is served LOCALLY from `/draco/` (copied from three's bundled
 * gltf decoder) so the reveal never depends on a third-party CDN.
 *
 * Orientation: the raw model's long axis is Z and its flat faces are the ±Y
 * faces. An inner `orient` group stands it VERTICAL (bow up) with a flat face to
 * camera and scales it to frame. The OUTER group (`groupRef`) is the one
 * KeyCanvas twists about world Y — the key's long axis — so it reads as a key
 * turning in a lock.
 */

const MODEL = '/assets/key.glb';

/** Vertical key height in world units — tuned to ≈75% of frame at KeyCanvas's
 *  camera framing (fov 32, z 6). */
const TARGET_WORLD_HEIGHT = 2.6;

export function KeyModel({ groupRef }: { groupRef: React.RefObject<Group> }) {
  const { scene } = useGLTF(MODEL, '/draco/');
  const idle = useRef<Group>(null);
  const orient = useRef<Group>(null);

  // Clone once and adjust the material for shine — keep every baked map.
  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      if (!(o as Mesh).isMesh) return;
      const mesh = o as Mesh;
      const src = mesh.material as MeshStandardMaterial;

      let mat: MeshPhysicalMaterial;
      if ((src as unknown as { isMeshPhysicalMaterial?: boolean }).isMeshPhysicalMaterial) {
        mat = src as unknown as MeshPhysicalMaterial;
      } else {
        // Carry over every map + colour + PBR value from the Standard material.
        // (MeshPhysicalMaterial.copy(standard) throws on physical-only props, so
        // invoke the Standard copy on the physical instance, then add clearcoat.)
        mat = new MeshPhysicalMaterial();
        MeshStandardMaterial.prototype.copy.call(mat, src);
      }

      mat.envMapIntensity = 1.8;
      mat.roughness = 0.65; // multiplies the existing roughness map
      mat.clearcoat = 0.4;
      mat.clearcoatRoughness = 0.15;
      mat.needsUpdate = true;

      mesh.material = mat;
      mesh.castShadow = mesh.receiveShadow = false;
    });
    return root;
  }, [scene]);

  // Centre + scale + stand the key vertical (bow up), flat face to camera.
  useLayoutEffect(() => {
    const o = orient.current;
    if (!o) return;
    o.rotation.set(0, 0, 0);
    o.scale.set(1, 1, 1);
    const box = new Box3().setFromObject(o);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    model.position.sub(center);
    o.rotation.x = Math.PI / 2; // long axis Z → vertical, bow up
    o.scale.setScalar(TARGET_WORLD_HEIGHT / size.z);
  }, [model]);

  // Gentle idle sway so the still frame is never dead. Kept to a vertical
  // breath only (no rotation) so it never fights the scroll-driven twist.
  useFrame((state) => {
    if (idle.current) {
      idle.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
    }
  });

  return (
    // outer group = the scroll-driven TWIST about world Y (set by KeyCanvas)
    <group ref={groupRef}>
      <group ref={idle}>
        <group ref={orient}>
          <primitive object={model} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL, '/draco/');
