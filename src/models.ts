import { Matrix4, Vector2, Vector3 } from "three";
import { TreeSegment } from "./tree-segment";
import { TreeSpawner } from "./tree-spawner";

export interface TreeGeometryParams {
  generations: number;
  length: number;
  uvLength: number;
  radius: number;
  radiusSegments: number;
  heightSegments: number;
  from?: TreeSegment | Vector3;
  rotation?: Matrix4;
  uvOffset?: number;
  generation?: number;
  spawner?: TreeSpawner;
}

export type BuildData = [Vector3[], number[], Vector2[]];