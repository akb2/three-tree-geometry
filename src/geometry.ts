import { round } from "@akb2/math";
import { createArray } from "@akb2/types-tools";
import { BufferGeometry, Float32BufferAttribute, Vector2, Vector3 } from "three";
import { searchBranchPoints } from "./helpers";
import { BuildData, TreeGeometryParams } from "./models";
import { Tree } from "./tree";
import { TreeBranch } from "./tree-branch";
import { TreeSegment } from "./tree-segment";

export class TreeGeometry extends BufferGeometry {
  private tree: Tree;
  private positionsOfBranches: Vector3[] = [];
  override type: string = "TreeGeometry";

  branchesEnds: Vector3[] = [];

  // Список точек на ветках
  getPositionsOfBranches(skip: number = 0): Vector3[] {
    if (!this.positionsOfBranches) {
      const search: (node: TreeBranch) => Vector3[] = (node: TreeBranch) => ([
        ...node.segments
          .map(({ vertices }) => vertices)
          .map(vertices => {
            const x: number = round(vertices.map(({ x }) => x).reduce((o, x) => o + x, 0) / vertices.length, 5);
            const y: number = round(vertices.map(({ y }) => y).reduce((o, y) => o + y, 0) / vertices.length, 5);
            const z: number = round(vertices.map(({ z }) => z).reduce((o, z) => o + z, 0) / vertices.length, 5);
            return new Vector3(x, y, z);
          }),
        ...node.children.map(n => search(n)).reduce((o, v) => ([...o, ...v]), [])
      ]);
      this.positionsOfBranches = search(this.tree.root).sort(({ y: yA }, { y: yB }) => yA > yB ? 1 : yA < yB ? -1 : 0);
    }
    // Поиск данных
    return this.positionsOfBranches.filter((p, k) => k >= skip);
  }

  constructor(
    private parameters: TreeGeometryParams
  ) {
    super();
    // Определение параметров
    this.parameters = parameters;
    this.tree = new Tree(this.parameters);
    this.branchesEnds = searchBranchPoints(this.tree.root, this.parameters.generations);
    // Построение геометрии
    const [vertices, faces, faceVertexUvs]: BuildData = this.buildBranches(this.tree.root);
    const position: number[] = [];
    const uvs: number[] = [];
    // Текстурная сетка
    faceVertexUvs.forEach(uv => uvs.push(uv.x, uv.y));
    vertices.forEach(({ x, y, z }) => position.push(x, y, z));
    // Сетка
    const positionArray: Float32BufferAttribute = new Float32BufferAttribute(position, 3);
    const uvsArray: Float32BufferAttribute = new Float32BufferAttribute(uvs, 2);
    // Параметры
    this.setIndex(faces);
    this.setAttribute("position", positionArray);
    this.setAttribute("uv", uvsArray);
    this.setAttribute("uv2", uvsArray);
    this.computeVertexNormals();
  }

  override copy(source: this): this {
    super.copy(source);
    // Копируем дополнительные свойства и параметры
    this.tree = source.tree;
    this.positionsOfBranches = source.positionsOfBranches?.map(v => v.clone()) ?? [];
    this.parameters = { ...source.parameters };
    this.branchesEnds = searchBranchPoints(this.tree.root, this.parameters.generations);
    // Вернуть текущий экземпляр
    return this;
  }

  override clone(): this {
    const parametersCopy = { ...this.parameters };
    const newGeometry = new TreeGeometry(parametersCopy) as this;
    // Копирование
    newGeometry.copy(this);
    // Вернуть новый экземпляр
    return newGeometry;
  }

  // Создание общей геометрии
  private buildBranches(branch: TreeBranch, offset: number = 0): BuildData {
    const [vertices, faces, faceVertexUvs]: BuildData = this.buildBranch(branch, offset);
    // Цикл по потомкам
    if (!!branch.children?.length) {
      branch.children.forEach(child => {
        const [childVertices, childFaces, childFaceVertexUvs]: BuildData = this.buildBranches(child, offset + vertices.length);
        // Добавить параметры
        childVertices.forEach(v => vertices.push(v));
        childFaces.forEach(f => faces.push(f));
        childFaceVertexUvs.forEach(u => faceVertexUvs.push(u));
      });
    }
    // Вернуть параметры
    return [vertices, faces, faceVertexUvs];
  }

  // Создание геометрии
  private buildBranch(branch: TreeBranch, offset: number = 0): BuildData {
    const radiusSegments: number = branch.radiusSegments;
    const heightSegments: number = branch.segments.length - 1;
    const faces: number[] = [];
    const indices: number[][] = [];
    const uvs: Vector2[] = [];
    const vertices: Vector3[] = [];
    let index: number = 0;
    // Цикл по сегментам высоты
    createArray(heightSegments + 1).forEach(y => {
      const indicesRow: number[] = [];
      const segment = branch.segments[y];
      // Добавить параметры
      vertices.push(...segment.vertices);
      uvs.push(...segment.uvs);
      // Цикл по сегментам радиуса
      createArray(radiusSegments + 1).forEach(() => indicesRow.push(index++));
      // Добавить индексы
      indices.push(indicesRow);
    });
    // Создание сторон
    createArray(heightSegments).forEach(y => createArray(radiusSegments).forEach(x => {
      const cy: number = y;
      const ny: number = y + 1;
      const cx: number = x;
      const nx: number = x + 1;
      const v1: number = indices[cy][cx] + offset;
      const v2: number = indices[ny][cx] + offset;
      const v3: number = indices[ny][nx] + offset;
      const v4: number = indices[cy][nx] + offset;
      // Секция A
      faces.push(v1, v4, v2, v2, v4, v3);
    }));

    // Начальный фрагмент
    if (!branch.from) {
      const bottom: TreeSegment = branch.segments[0]; 4
      // Добавить параметр
      vertices.push(bottom.position);
      uvs.push(...bottom.uvs);
      // Цикл по сегментам радиуса
      createArray(radiusSegments).map(x => {
        const v1: number = indices[0][x] + offset;
        const v2: number = indices[0][x + 1] + offset;
        const v3: number = index + offset;
        // Записать параметры
        faces.push(v1, v3, v2);
      });
    }
    // Остальные фрагменты
    else {
      const from: TreeSegment = branch.from;
      const bottomIndices: number[] = createArray(radiusSegments + 1).map(() => (index++) + offset);
      // Добавить индексы
      vertices.push(...from.vertices);
      uvs.push(...from.uvs);
      indices.push(bottomIndices);
      // Цикл по радиальным сегментам
      createArray(radiusSegments).forEach(x => {
        const v0: number = indices[0][x] + offset;
        const v1: number = indices[0][x + 1] + offset;
        const v2: number = bottomIndices[x];
        const v3: number = bottomIndices[x + 1];
        // Секции
        faces.push(v0, v3, v1, v0, v2, v3);
      });
    }
    // Вернуть параметры
    return [vertices, faces, uvs];
  }
}