/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AEILORIA — FREEDOM BOND VISUALIZER
 * 3D State-Space Node & Vector Transition Chamber (BondCanvas3D)
 * Strict laboratory-grade Three.js visualization.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  AgentState,
  BondStateClassification,
  ExperimentStage,
  InteractionRecord,
} from '../types/experiment';
import { RotateCw, Maximize2, Shield, Eye, Compass, Layers } from 'lucide-react';

interface BondCanvas3DProps {
  agents: AgentState[];
  agentsAtX: AgentState[];
  agentsAtZ: AgentState[];
  agentsAtZPrime: AgentState[];
  interactions: InteractionRecord[];
  activeStage: ExperimentStage;
  classification: BondStateClassification;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
}

export const BondCanvas3D: React.FC<BondCanvas3DProps> = ({
  agents,
  agentsAtX,
  agentsAtZ,
  agentsAtZPrime,
  interactions,
  activeStage,
  classification,
  selectedAgentId,
  onSelectAgent,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredAgent, setHoveredAgent] = useState<{
    id: string;
    f: number;
    v: number;
    ether: number;
    fire: number;
    x: number;
    y: number;
  } | null>(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showLattice, setShowLattice] = useState(true);

  // References to preserve Three.js state across renders without re-instantiating scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodesGroupRef = useRef<THREE.Group | null>(null);
  const bondsGroupRef = useRef<THREE.Group | null>(null);
  const vectorsGroupRef = useRef<THREE.Group | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Camera spherical coordinates for interactive drag controls
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 24 });
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  // Map agents to 3D state coordinates: f -> X, v -> Y, ether -> Z
  const mapTo3D = (a: AgentState): THREE.Vector3 => {
    return new THREE.Vector3(
      (a.freedom_state - 0.5) * 14,
      (a.freedoms_vice - 0.5) * 14,
      (a.ether_permeability - 0.5) * 14
    );
  };

  // Primary setup on mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfdfd);
    sceneRef.current = scene;

    // Subtle atmospheric fog for spatial depth
    scene.fog = new THREE.FogExp2(0xfcfdfd, 0.015);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    const updateCamPos = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };
    updateCamPos();

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(12, 18, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xec4899, 0.4); // Subtle pink rim accent
    dirLight2.position.set(-15, -10, -12);
    scene.add(dirLight2);

    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 0.5); // Cyan crystal reflection
    cyanRimLight.position.set(10, -12, 10);
    scene.add(cyanRimLight);

    // 5. 3D Coordinate Grid & Axis Box
    const gridHelper = new THREE.GridHelper(16, 16, 0xec4899, 0xe4e4e7);
    gridHelper.position.y = -7;
    scene.add(gridHelper);

    // Bounding cube wireframe representing the [0, 1]^3 state volume
    const boxGeo = new THREE.BoxGeometry(14, 14, 14);
    const boxMat = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.65,
    });
    const boxWire = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), boxMat);
    scene.add(boxWire);

    // 6. Component Groups
    const nodesGroup = new THREE.Group();
    const bondsGroup = new THREE.Group();
    const vectorsGroup = new THREE.Group();
    scene.add(nodesGroup);
    scene.add(bondsGroup);
    scene.add(vectorsGroup);
    nodesGroupRef.current = nodesGroup;
    bondsGroupRef.current = bondsGroup;
    vectorsGroupRef.current = vectorsGroup;

    // 7. Raycasting for Node Hover and Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current) {
        const dx = event.clientX - prevMouseRef.current.x;
        const dy = event.clientY - prevMouseRef.current.y;
        prevMouseRef.current = { x: event.clientX, y: event.clientY };

        cameraAngleRef.current.theta += dx * 0.008;
        cameraAngleRef.current.phi = Math.max(
          0.1,
          Math.min(Math.PI - 0.1, cameraAngleRef.current.phi - dy * 0.008)
        );
        updateCamPos();
      }

      // Check hover
      if (nodesGroupRef.current && cameraRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(nodesGroupRef.current.children);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const agentId = hit.userData.agentId;
          const agent = agents.find((a) => a.id === agentId);
          if (agent) {
            setHoveredAgent({
              id: agent.id,
              f: agent.freedom_state,
              v: agent.freedoms_vice,
              ether: agent.ether_permeability,
              fire: agent.fire_potency,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
            container.style.cursor = 'pointer';
            return;
          }
        }
      }
      setHoveredAgent(null);
      container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
    };

    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: event.clientX, y: event.clientY };
      container.style.cursor = 'grabbing';
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      container.style.cursor = 'grab';

      // If click was a fast tap, raycast and trigger selection
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (nodesGroupRef.current && cameraRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(nodesGroupRef.current.children);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          if (hit.userData.agentId) {
            onSelectAgent(hit.userData.agentId);
          }
        }
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      cameraAngleRef.current.radius = Math.max(
        10,
        Math.min(45, cameraAngleRef.current.radius + event.deltaY * 0.02)
      );
      updateCamPos();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handleMouseMove);
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    // 8. Animation & Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDraggingRef.current) {
        cameraAngleRef.current.theta += delta * 0.15;
        updateCamPos();
      }

      // Dynamic animation effects depending on classification
      if (bondsGroupRef.current && classification === 'SELF_SUSTAINING') {
        // Iridescent crystal lattice shimmer
        const time = clock.getElapsedTime();
        bondsGroupRef.current.children.forEach((child, idx) => {
          if (child instanceof THREE.Line) {
            const mat = child.material as THREE.LineBasicMaterial;
            if (mat) {
              mat.opacity = 0.55 + 0.35 * Math.sin(time * 2.5 + idx * 0.4);
            }
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousemove', handleMouseMove);
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('wheel', handleWheel);

      renderer.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      gridHelper.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, []);

  // Update 3D Nodes, Bonds, and Vectors whenever state or classification changes
  useEffect(() => {
    const nodesGroup = nodesGroupRef.current;
    const bondsGroup = bondsGroupRef.current;
    const vectorsGroup = vectorsGroupRef.current;
    if (!nodesGroup || !bondsGroup || !vectorsGroup) return;

    // Clear previous geometry children
    while (nodesGroup.children.length > 0) {
      const obj = nodesGroup.children[0] as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else if (obj.material) obj.material.dispose();
      nodesGroup.remove(obj);
    }
    meshesMapRef.current.clear();

    while (bondsGroup.children.length > 0) {
      const obj = bondsGroup.children[0] as THREE.Line;
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) (obj.material as THREE.Material).dispose();
      bondsGroup.remove(obj);
    }

    while (vectorsGroup.children.length > 0) {
      const obj = vectorsGroup.children[0] as THREE.Line | THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) (obj.material as THREE.Material).dispose();
      vectorsGroup.remove(obj);
    }

    // Material and Geometry Definitions based on strict classification specifications:
    // 1. SELF_SUSTAINING: iridescent cyan-white crystal lattice for authentic non-coercive bonds
    // 2. FORCED: collapsing dashed grey trace
    // 3. ADAPTED: amber/gold structured network
    // 4. BASELINE: neutral silver/zinc wireframe
    const isSelfSustaining = classification === 'SELF_SUSTAINING';
    const isForced = classification === 'FORCED';
    const isAdapted = classification === 'ADAPTED';

    // 1. Render Agent Nodes
    agents.forEach((agent) => {
      const pos = mapTo3D(agent);
      const isSelected = agent.id === selectedAgentId;

      let geo: THREE.BufferGeometry;
      let mat: THREE.Material;

      if (isSelfSustaining) {
        // Iridescent cyan-white crystal lattice: Octahedron crystal geometry
        geo = new THREE.OctahedronGeometry(isSelected ? 0.65 : 0.45);
        mat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xffffff : 0xccfbf1,
          emissive: 0x06b6d4,
          emissiveIntensity: isSelected ? 0.8 : 0.45,
          roughness: 0.1,
          metalness: 0.2,
        });
      } else if (isForced) {
        // FORCED: Collapsing dashed grey trace / rough decaying cube
        geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        mat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          wireframe: true,
          roughness: 0.8,
          metalness: 0.05,
        });
      } else if (isAdapted) {
        // ADAPTED: Amber-gold polyhedral nodes
        geo = new THREE.DodecahedronGeometry(isSelected ? 0.58 : 0.4);
        mat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xfef08a : 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: isSelected ? 0.6 : 0.3,
          roughness: 0.25,
          metalness: 0.3,
        });
      } else {
        // BASELINE: Neutral zinc/silver spheres
        geo = new THREE.SphereGeometry(isSelected ? 0.5 : 0.35, 16, 16);
        mat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xec4899 : 0x71717a,
          emissive: isSelected ? 0xdb2777 : 0x27272a,
          emissiveIntensity: isSelected ? 0.4 : 0.1,
          roughness: 0.4,
          metalness: 0.1,
        });
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { agentId: agent.id };
      nodesGroup.add(mesh);
      meshesMapRef.current.set(agent.id, mesh);

      // Selected ring indicator
      if (isSelected) {
        const ringGeo = new THREE.RingGeometry(0.75, 0.9, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xec4899,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        ringMesh.lookAt(cameraRef.current ? cameraRef.current.position : new THREE.Vector3(0, 10, 20));
        nodesGroup.add(ringMesh);
      }
    });

    // 2. Render Pairwise Bonds / Network Lattice
    if (showLattice && agents.length > 1) {
      for (let i = 0; i < agents.length; i++) {
        for (let j = i + 1; j < agents.length; j++) {
          const a1 = agents[i];
          const a2 = agents[j];
          const p1 = mapTo3D(a1);
          const p2 = mapTo3D(a2);
          const dist = p1.distanceTo(p2);

          // Interaction connection criterion
          const didInteract = interactions.some(
            (r) =>
              (r.agent_a_id === a1.id && r.agent_b_id === a2.id) ||
              (r.agent_a_id === a2.id && r.agent_b_id === a1.id)
          );

          if (dist < 7.5 || didInteract) {
            const points = [p1, p2];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

            let lineMat: THREE.LineBasicMaterial;

            if (isSelfSustaining) {
              // Iridescent cyan-white crystal lattice
              lineMat = new THREE.LineBasicMaterial({
                color: didInteract ? 0x22d3ee : 0xa5f3fc,
                transparent: true,
                opacity: didInteract ? 0.85 : 0.35,
                linewidth: didInteract ? 2 : 1,
              });
            } else if (isForced) {
              // Collapsing dashed grey trace
              lineMat = new THREE.LineDashedMaterial({
                color: 0x94a3b8,
                dashSize: 0.3,
                gapSize: 0.25,
                transparent: true,
                opacity: 0.45,
              });
            } else if (isAdapted) {
              lineMat = new THREE.LineBasicMaterial({
                color: 0xf59e0b,
                transparent: true,
                opacity: 0.5,
              });
            } else {
              lineMat = new THREE.LineBasicMaterial({
                color: 0xe2e8f0,
                transparent: true,
                opacity: 0.4,
              });
            }

            const line = new THREE.Line(lineGeo, lineMat);
            if (isForced) {
              line.computeLineDistances();
            }
            bondsGroup.add(line);
          }
        }
      }
    }

    // 3. Render State-Space Vector Transition Pipeline (x -> z -> z')
    if (showVectors && agentsAtX.length > 0 && agentsAtZ.length > 0 && agentsAtZPrime.length > 0) {
      agents.forEach((agent) => {
        const xAgent = agentsAtX.find((a) => a.id === agent.id);
        const zAgent = agentsAtZ.find((a) => a.id === agent.id);
        const zPrimeAgent = agentsAtZPrime.find((a) => a.id === agent.id);

        if (xAgent && zAgent && zPrimeAgent) {
          const ptX = mapTo3D(xAgent);
          const ptZ = mapTo3D(zAgent);
          const ptZPrime = mapTo3D(zPrimeAgent);

          // Vector 1: x -> z (Stage B applied influence shift)
          const pointsXZ = [ptX, ptZ];
          const geoXZ = new THREE.BufferGeometry().setFromPoints(pointsXZ);
          const matXZ = new THREE.LineBasicMaterial({
            color: 0xec4899, // Pink vector for applied V1
            transparent: true,
            opacity: 0.6,
          });
          vectorsGroup.add(new THREE.Line(geoXZ, matXZ));

          // Vector 2: z -> z' (Stage D removal persistence shift)
          const pointsZZPrime = [ptZ, ptZPrime];
          const geoZZPrime = new THREE.BufferGeometry().setFromPoints(pointsZZPrime);
          const matZZPrime = new THREE.LineBasicMaterial({
            color: isSelfSustaining ? 0x06b6d4 : isForced ? 0x94a3b8 : 0xf59e0b,
            transparent: true,
            opacity: 0.65,
          });
          vectorsGroup.add(new THREE.Line(geoZZPrime, matZZPrime));

          // Origin ghost point at x
          const originGeo = new THREE.SphereGeometry(0.12, 8, 8);
          const originMat = new THREE.MeshBasicMaterial({
            color: 0xa1a1aa,
            transparent: true,
            opacity: 0.4,
          });
          const originMesh = new THREE.Mesh(originGeo, originMat);
          originMesh.position.copy(ptX);
          vectorsGroup.add(originMesh);
        }
      });
    }
  }, [agents, agentsAtX, agentsAtZ, agentsAtZPrime, interactions, classification, selectedAgentId, showVectors, showLattice]);

  const resetCamera = () => {
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 24 };
    if (cameraRef.current) {
      const { theta, phi, radius } = cameraAngleRef.current;
      cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
      cameraRef.current.position.y = radius * Math.cos(phi);
      cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="relative rounded border border-zinc-200 bg-white p-3 shadow-xs">
      {/* 3D Visualizer Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2 mb-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-pink-600" />
          <span className="font-semibold uppercase tracking-wider text-zinc-900">
            BondCanvas3D // State-Space Transition Chamber
          </span>
          <span
            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border ${
              classification === 'SELF_SUSTAINING'
                ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                : classification === 'FORCED'
                ? 'bg-zinc-100 border-zinc-300 text-zinc-600'
                : classification === 'ADAPTED'
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}
          >
            {classification === 'SELF_SUSTAINING' && '✦ IRIDESCENT CYAN LATTICE (SELF_SUSTAINING)'}
            {classification === 'FORCED' && '⋯ COLLAPSING DASHED GREY (FORCED)'}
            {classification === 'ADAPTED' && '◆ METASTABLE NETWORK (ADAPTED)'}
            {classification === 'BASELINE' && '○ BASELINE SEED (BASELINE)'}
          </span>
        </div>

        {/* Viewport Control Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              showVectors
                ? 'border-pink-300 bg-pink-50 text-pink-700 font-semibold'
                : 'border-zinc-200 bg-zinc-50 text-zinc-500'
            }`}
            title="Toggle x -> z -> z' vector displacement lines"
          >
            x→z→z&apos; Trajectories
          </button>
          <button
            onClick={() => setShowLattice(!showLattice)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              showLattice
                ? 'border-cyan-300 bg-cyan-50 text-cyan-700 font-semibold'
                : 'border-zinc-200 bg-zinc-50 text-zinc-500'
            }`}
            title="Toggle pairwise interaction lattice bonds"
          >
            Lattice Bonds
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1 rounded border text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors ${
              autoRotate ? 'border-pink-300 bg-pink-50 text-pink-700' : 'border-zinc-200'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={resetCamera}
            className="p-1 rounded border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            title="Reset Camera Orientation"
          >
            <Compass className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="relative h-[440px] w-full rounded border border-zinc-200 bg-[#fcfdfd] overflow-hidden select-none"
      >
        {/* State Axis Legend Overlay */}
        <div className="absolute top-2 left-2 pointer-events-none rounded bg-white/90 px-2 py-1.5 font-mono text-[10px] text-zinc-600 backdrop-blur-xs border border-zinc-200 shadow-xs space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-pink-500" />
            <span>X: Freedom State [0, 1]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-zinc-700" />
            <span>Y: Freedom&apos;s Vice [0, 1]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-500" />
            <span>Z: Ether Permeability [0, 1]</span>
          </div>
          <div className="pt-1 text-[9px] text-zinc-400">Drag to rotate · Scroll to zoom</div>
        </div>

        {/* Floating Node Hover HUD */}
        {hoveredAgent && (
          <div
            className="absolute pointer-events-none z-10 rounded border border-pink-200 bg-white/95 px-2.5 py-1.5 font-mono text-[11px] text-zinc-800 shadow-md backdrop-blur-xs"
            style={{
              left: `${Math.min(hoveredAgent.x + 12, 480)}px`,
              top: `${Math.max(hoveredAgent.y - 40, 10)}px`,
            }}
          >
            <div className="font-bold text-pink-700">{hoveredAgent.id}</div>
            <div className="text-[10px] text-zinc-600">
              f: {hoveredAgent.f.toFixed(3)} | v: {hoveredAgent.v.toFixed(3)}
            </div>
            <div className="text-[10px] text-zinc-500">
              Ether: {hoveredAgent.ether.toFixed(3)} | Fire: {hoveredAgent.fire.toFixed(3)}
            </div>
            <div className="text-[9px] text-pink-500 italic mt-0.5">Click node to inspect</div>
          </div>
        )}
      </div>
    </div>
  );
};
