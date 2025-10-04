import { Vector3 } from "three";
import { TreeBranch } from "./tree-branch";

export const searchBranchPoints = (node: TreeBranch, generations: number, points: Vector3[] = []): Vector3[] => {
  if (node.children.length > 0) {
    node.children.forEach(n => searchBranchPoints(n, generations, points));

    if (node.children.length <= generations) {
      points.push(node.to);
    }
  }

  return points;
};