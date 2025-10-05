# 🌳 @akb2/three-tree-geometry

A lightweight procedural **tree geometry generator** for [Three.js](https://threejs.org), written in TypeScript. It creates realistic, branching 3D tree structures using custom geometry based on configurable parameters.

## Installation

```bash
npm install @akb2/three-tree-geometry
```

## Overview

`@akb2/three-tree-geometry` provides a procedural tree mesh generator built on top of `THREE.BufferGeometry`. It constructs a complete 3D tree — including branches, segments, and UV-mapped faces — ready for rendering or further manipulation in Three.js.

The library is part of the [`@akb2` toolset](https://www.npmjs.com/org/akb2), and integrates well with:

* [`@akb2/math`](https://www.npmjs.com/package/@akb2/math)
* [`@akb2/types-tools`](https://www.npmjs.com/package/@akb2/types-tools)

## Usage Example

```ts
import { MeshStandardMaterial, Mesh } from "three";
import { TreeGeometry } from "@akb2/three-tree-geometry";

// Define geometry parameters
const params = {
  generations: 5,
  length: 2.5,
  uvLength: 2,
  radius: 0.15,
  radiusSegments: 8,
  heightSegments: 5
};

// Create tree geometry and mesh
const geometry = new TreeGeometry(params);
const material = new MeshStandardMaterial({ color: 0x8B4513 });
const tree = new Mesh(geometry, material);

// Add to scene
scene.add(tree);
```

---

## Class: `TreeGeometry`

Extends: `THREE.BufferGeometry`

### Constructor

```ts
new TreeGeometry(parameters: TreeGeometryParams)
```

#### Parameters (`TreeGeometryParams`)

| Name             | Type                     | Description                                        |
| ---------------- | ------------------------ | -------------------------------------------------- |
| `generations`    | `number`                 | Number of recursive branch generations             |
| `length`         | `number`                 | Base branch length                                 |
| `uvLength`       | `number`                 | UV scaling along branch height                     |
| `radius`         | `number`                 | Base radius of the trunk                           |
| `radiusSegments` | `number`                 | Number of segments around the branch circumference |
| `heightSegments` | `number`                 | Number of vertical segments per branch             |
| `from?`          | `TreeSegment \| Vector3` | Optional starting point for sub-branches           |
| `rotation?`      | `Matrix4`                | Optional rotation matrix                           |
| `uvOffset?`      | `number`                 | UV offset value                                    |
| `generation?`    | `number`                 | Current branch generation index                    |
| `spawner?`       | `TreeSpawner`            | Optional reference for procedural spawning         |

---

### Properties

| Property              | Type        | Description                                   |
| --------------------- | ----------- | --------------------------------------------- |
| `branchesEnds`        | `Vector3[]` | Endpoints of all generated branches           |
| `positionsOfBranches` | `Vector3[]` | Cached list of averaged points along branches |
| `type`                | `string`    | Always `"TreeGeometry"`                       |

---

### Methods

#### `getPositionsOfBranches(skip?: number): Vector3[]`

Returns all branch points (center positions of each segment), sorted by Y coordinate.
Optional `skip` parameter allows skipping the first *n* points.

---

#### `clone(): this`

Creates a deep copy of the geometry, including its parameters and computed branches.

#### `copy(source: this): this`

Copies geometry data and parameters from another `TreeGeometry` instance.

---

### Internal Methods (for advanced use)

These are used internally but can be overridden for custom generation:

* `buildBranches(branch: TreeBranch, offset?: number): BuildData`
* `buildBranch(branch: TreeBranch, offset?: number): BuildData`

Both methods construct vertices, faces, and UVs for each branch and its children recursively.

---

## Dependencies

* [`three`](https://www.npmjs.com/package/three)
* [`@akb2/math`](https://www.npmjs.com/package/@akb2/math)
* [`@akb2/types-tools`](https://www.npmjs.com/package/@akb2/types-tools)

---

## License

MIT © 2025 [Andrei Kobelev @akb2](https://github.com/akb2)
| [Github repository](https://github.com/akb2/three-tree-geometry)
| [LinkedIn](http://linkedin.com/in/akb2)
