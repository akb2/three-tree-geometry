import { createArray, MultiArray } from "@akb2/types-tools";
import { CatmullRomCurve3, Euler, Matrix4, Vector3 } from "three";
import { TreeGeometryParams } from "./models";
import { TreeSegment } from "./tree-segment";
import { TreeSpawner } from "./tree-spawner";

export class TreeBranch implements Omit<TreeGeometryParams, "spawner"> {
  generations: number;
  length: number = 0;
  uvLength: number = 10.0;
  radius: number = 0.1;
  radiusSegments: number;
  heightSegments: number;
  from?: TreeSegment;
  rotation: Matrix4;
  uvOffset: number = 0.0;
  generation: number = 0;
  to: Vector3;
  position: Vector3 = new Vector3();
  segments: TreeSegment[];
  children: TreeBranch[];

  constructor(
    private parameters: TreeGeometryParams
  ) {
    // Параметры класса
    this.rotation = parameters.rotation ?? new Matrix4();
    this.length = parameters.length;
    this.generation = parameters.generation ?? this.generation;
    this.generations = parameters.generations;
    this.uvLength = parameters.uvLength ?? this.uvLength;
    this.uvOffset = parameters.uvOffset ?? this.uvOffset;
    this.radius = parameters.radius ?? this.radius;
    this.radiusSegments = parameters.radiusSegments;
    this.heightSegments = parameters.heightSegments;
    // Параметры
    const direction: Vector3 = (new Vector3(0, 1, 0)).applyMatrix4(this.rotation);
    // Начало и позиция
    if (parameters.from instanceof TreeSegment) {
      this.from = parameters.from;
      this.position = parameters.from.position.clone().add(new Vector3(0, 1, 0).applyMatrix4(parameters.from.rotation).setLength(0.05));
    }
    // Начальная позиция
    else if (parameters.from instanceof Vector3) {
      this.position = parameters.from;
    }
    // Прочие параметры
    this.to = this.position.clone().add(direction.setLength(this.length));
    this.segments = this.buildTreeSegments(this.radius, this.radiusSegments, direction, this.heightSegments);
    this.children = [];
  }

  clone(): this {
    const parametersCopy: TreeGeometryParams = { ...this.parameters };
    const newTreeBranch = new TreeBranch(parametersCopy) as this;
    // Копирование
    newTreeBranch.copy(this);
    // Вернуть новый экземпляр
    return newTreeBranch;
  }

  copy(source: this): this {
    this.rotation = source.rotation;
    this.length = source.length;
    this.generation = source.generation;
    this.generations = source.generations;
    this.uvLength = source.uvLength;
    this.uvOffset = source.uvOffset;
    this.radius = source.radius;
    this.radiusSegments = source.radiusSegments;
    this.heightSegments = source.heightSegments;
    this.from = source.from?.clone();
    this.to = source.to.clone();
    this.position = source.position.clone();
    this.segments = source.segments?.map(s => s.clone()) ?? [];
    this.children = source.children?.map(s => s.clone()) ?? [];
    // Вернуть текущий экземпляр
    return this;
  }

  // Создание сегментов
  private buildTreeSegments(radius: number, radiusSegments: number, direction: Vector3, heightSegments: number): TreeSegment[] {
    const theta: number = Math.PI * 0.25;
    const htheta: number = theta * 0.5;
    const x: number = Math.random() * theta - htheta;
    const z: number = Math.random() * theta - htheta;
    const rot: Matrix4 = new Matrix4();
    const euler: Euler = new Euler(x, 0, z);
    // Применить параметры
    rot.makeRotationFromEuler(euler);
    direction.applyMatrix4(rot);
    // Прочие параметры
    const controlPoint: Vector3 = this.position.clone().add(direction.setLength(this.length * 0.5));
    const curve: CatmullRomCurve3 = new CatmullRomCurve3([this.position, controlPoint, this.to]);
    const fromRatio: number = this.generation == 0 ? 1 : 1 - (this.generation / (this.generations + 1));
    const toRatio: number = 1.0 - ((this.generation + 1) / (this.generations + 1));
    const fromRadius: number = radius * fromRatio;
    const toRadius: number = radius * toRatio;
    const rotation: Matrix4 = this.rotation;
    const segments: TreeSegment[] = [];
    const uvLength: number = this.uvLength;
    const points: Vector3[] = curve.getPoints(heightSegments);
    let uvOffset: number = this.uvOffset;
    // Для всех кроме начальной ветки
    if (!!this.from && this.from instanceof TreeSegment) {
      uvOffset += this.from.position.distanceTo(points[0]) / uvLength;
    }
    // Добавить сегмент
    segments.push(new TreeSegment(points[0], rotation, uvOffset, fromRadius, radiusSegments));
    // Цикл по сегментам
    createArray(heightSegments - 1).map(i => i + 1).forEach(i => {
      const p0: Vector3 = points[i];
      const p1: Vector3 = points[i + 1];
      const ry: number = i / (heightSegments - 1);
      const radius: number = fromRadius + ((toRadius - fromRadius) * ry);
      const d: number = p1.distanceTo(p0);
      // Прибавить к смещению
      uvOffset += d / uvLength;
      // Запомнить сегмент
      segments.push(new TreeSegment(p0, rotation, uvOffset, radius, radiusSegments));
    });
    // Вернуть сегменты
    return segments;
  }

  // Ветка
  branch(spawner: TreeSpawner, count: number): void {
    createArray(count).forEach(i => this.spawn(spawner, i == 0));

    this.children.forEach(child => child.branch(spawner, count - 1));
  }

  // Растягивание
  grow(spawner: TreeSpawner): void {
    !!this.children?.length ?
      this.children.forEach(child => child.grow(spawner)) :
      this.branch(spawner, 1);
  }

  // Спаун
  private spawn(spawner: TreeSpawner, extension: boolean): void {
    const child: TreeBranch = spawner.spawn(this, extension);
    // Добавить потомка
    this.children.push(child);
  }

  // Структура веток
  branchlets(): MultiArray<TreeBranch> {
    return !!this.children.length ?
      this.children.map(child => child.branchlets()) :
      [this as TreeBranch];
  }

  // Вычислить высоту
  private calculateLength(): number {
    const segments: TreeSegment[] = this.segments;
    let length: number = 0;
    // Цикл по сегментам
    createArray(segments.length).forEach(i => {
      const p0: Vector3 = segments[i].position;
      const p1: Vector3 = segments[i + 1].position;
      //  Добавить длину
      length += p0.distanceTo(p1);
    });
    // Вернуть длину
    return length;
  }
}