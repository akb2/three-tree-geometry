import { Matrix4, Vector2, Vector3 } from "three";

export class TreeSegment {
  vertices: Vector3[] = [];
  uvs: Vector2[] = [];

  constructor(
    public position: Vector3,
    public rotation: Matrix4,
    public uvOffset: number,
    private radius: number,
    private radiusSegments: number
  ) {
    const thetaLength: number = Math.PI * 2;
    // Цикл по сегментам
    CreateArray(this.radiusSegments + 1).forEach(x => {
      const u = x / this.radiusSegments;
      const uv = new Vector2(u, this.uvOffset);
      const vertex = new Vector3(this.radius * Math.sin(u * thetaLength), 0, this.radius * Math.cos(u * thetaLength))
        .applyMatrix4(this.rotation)
        .add(this.position);
      // Добавить в массив вершин и сеток
      this.vertices.push(vertex);
      this.uvs.push(uv);
    });
  }

  clone(): this {
    const newTreeBranch = new TreeSegment(
      this.position.clone(),
      this.rotation.clone(),
      this.uvOffset,
      this.radius,
      this.radiusSegments
    ) as this;
    // Копирование
    newTreeBranch.copy(this);
    // Вернуть новый экземпляр
    return newTreeBranch;
  }

  copy(source: this): this {
    this.vertices = source.vertices?.map(v => v.clone()) ?? [];
    this.uvs = source.uvs?.map(v => v.clone()) ?? [];
    // Вернуть текущий экземпляр
    return this;
  }
}