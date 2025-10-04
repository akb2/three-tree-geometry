import { Euler, Matrix4, Vector3 } from "three";
import { TreeGeometryParams } from "./models";
import { TreeBranch } from "./tree-branch";
import { TreeSegment } from "./tree-segment";
import { TreeSpawner } from "./tree-spawner";

export class Tree {
  private defaultLength: number = 3;
  private defaultUvLength: number = 10;
  private defaultGenerations: number = 5;
  private defaultRadius: number = 0.1;
  private defaultRadiusSegments: number = 8;
  private defaultHeightSegments: number = 8;

  from: Vector3 | TreeSegment;
  rotation: Matrix4 = new Matrix4();
  length: number;
  uvLength: number;
  generation: number = 0;
  generations: number;
  radius: number;
  radiusSegments: number;
  heightSegments: number;

  root: TreeBranch;
  private spawner: TreeSpawner;

  // Получение параметров из класса
  get getTreeGeometryParams(): TreeGeometryParams {
    return {
      generations: this.generations,
      length: this.length,
      uvLength: this.uvLength,
      radius: this.radius,
      radiusSegments: this.radiusSegments,
      heightSegments: this.heightSegments,
      from: this.from,
      rotation: this.rotation
    };
  }

  constructor(
    private parameters: TreeGeometryParams
  ) {
    this.from = parameters.from ?? new Vector3();
    // Поворот из параметров
    if (!!parameters?.rotation) {
      parameters.rotation instanceof Euler ?
        this.rotation.makeRotationFromEuler(parameters.rotation) : parameters.rotation instanceof Matrix4 ?
          this.rotation = parameters.rotation :
          null;
    }
    // Определение параметров
    this.length = parameters.length ?? this.defaultLength;
    this.uvLength = parameters.uvLength ?? this.defaultUvLength;
    this.generations = parameters.generations ?? this.defaultGenerations;
    this.radius = parameters.radius ?? this.defaultRadius;
    this.radiusSegments = parameters.radiusSegments ?? this.defaultRadiusSegments;
    this.heightSegments = parameters.heightSegments ?? this.defaultHeightSegments;
    // Начальная ветка
    this.root = new TreeBranch({ ...this.getTreeGeometryParams, generation: 0, });
    this.spawner = parameters.spawner || new TreeSpawner();
    this.root.branch(this.spawner, this.generations);
    this.grow(this.spawner);
  }

  copy(source: this): this {
    this.parameters = source.parameters;
    this.defaultLength = source.defaultLength;
    this.defaultUvLength = source.defaultUvLength;
    this.defaultGenerations = source.defaultGenerations;
    this.defaultRadius = source.defaultRadius;
    this.defaultRadiusSegments = source.defaultRadiusSegments;
    this.defaultHeightSegments = source.defaultHeightSegments;
    this.from = source.from.clone();
    this.rotation = source.rotation.clone();
    this.length = source.length;
    this.uvLength = source.uvLength;
    this.generation = source.generation;
    this.generations = source.generations;
    this.radius = source.radius;
    this.radiusSegments = source.radiusSegments;
    this.heightSegments = source.heightSegments;
    this.root = source.root.clone();
    this.spawner = source.spawner.clone();
    // Вернуть текущий экземпляр
    return this;
  }

  clone(): this {
    const parametersCopy = { ...this.parameters };
    const newTree = new Tree(parametersCopy) as this;
    // Копирование
    newTree.copy(this);
    // Вернуть новый экземпляр
    return newTree;
  }

  // Смазывание
  private grow(spawner: TreeSpawner) {
    spawner = spawner ?? this.spawner;
    // Запомнить параметры
    this.generation++;
  }

  branchlets(): MultiArray<TreeBranch> {
    return this.root.branchlets();
  }
}