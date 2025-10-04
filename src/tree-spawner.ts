import { random } from "@akb2/math";
import { Euler, Matrix4, Vector2 } from "three";
import { TreeBranch } from "./tree-branch";

export class TreeSpawner {
  constructor(
    private theta = Math.PI * 0.5,
    private attenuation = 0.75,
    private rootRange = new Vector2(0.75, 1.0)
  ) { }

  clone(): this {
    const newTreeSpawner = new TreeSpawner(this.theta, this.attenuation, this.rootRange.clone()) as this;
    // Вернуть новый экземпляр
    return newTreeSpawner;
  }

  // Генерация дерева
  spawn(branch: TreeBranch, extension: boolean = false): TreeBranch {
    const htheta = this.theta * 0.5;
    const x = random(0, 1, false, 5) * this.theta - htheta;
    const z = random(0, 1, false, 5) * this.theta - htheta;
    const len = branch.length * this.attenuation;
    const rot = new Matrix4();
    const euler = new Euler(x, 0, z);
    const segmentIndex = extension ?
      branch.segments.length - 1 :
      Math.floor((Math.random() * (this.rootRange.y - this.rootRange.x) + this.rootRange.x) * branch.segments.length);
    const segment = branch.segments[segmentIndex];
    // Преобразования
    rot.makeRotationFromEuler(euler);
    rot.multiply(branch.rotation);
    // Ветка
    return new TreeBranch({
      from: segment,
      rotation: rot,
      length: len,
      uvOffset: segment.uvOffset,
      uvLength: branch.uvLength,
      generation: branch.generation + 1,
      generations: branch.generations,
      radius: branch.radius,
      radiusSegments: branch.radiusSegments,
      heightSegments: branch.heightSegments
    });
  }
}