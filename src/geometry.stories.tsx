import { Meta, StoryObj } from "@storybook/preact";
import "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { AmbientLight, Color, DirectionalLight, DoubleSide, Mesh, MeshStandardMaterial, PerspectiveCamera, Plane, PlaneHelper, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { TreeGeometry } from "./geometry";

const controlTarget = new Vector3(2.0850889698494846, 10.06642047312474, -5.487957237730556);
const cameraPosition = new Vector3(-20.38335246601695, 31.489672312256786, 34.961361939949974);

const meta: Meta = {
  title: "Three/TreeGeometry",
  tags: ["autodocs"],
  argTypes: {
    generations: {
      name: "Generations",
      description: "Number of branch generations",
      control: {
        type: "number",
        min: 1,
        max: 7,
        step: 1
      }
    },
    length: {
      name: "Length",
      description: "Length of the main branch",
      control: {
        type: "number",
        min: 1,
        max: 20,
        step: 1
      }
    },
    uvLength: {
      name: "UV Length",
      description: "Length of the UV mapping",
      control: {
        type: "number",
        min: 1,
        max: 20,
        step: 1
      }
    },
    radius: {
      name: "Radius",
      description: "Radius of the main branch",
      control: {
        type: "number",
        min: 0.1,
        max: 3,
        step: 0.1
      }
    },
    radiusSegments: {
      name: "Radius Segments",
      description: "Number of segments around the radius",
      control: {
        type: "number",
        min: 3,
        max: 15,
        step: 1
      }
    },
    heightSegments: {
      name: "Height Segments",
      description: "Number of segments along the height",
      control: {
        type: "number",
        min: 1,
        max: 20,
        step: 1
      }
    }
  },
  args: {
    generations: 5,
    length: 12,
    uvLength: 10,
    radius: 0.9,
    radiusSegments: 8,
    heightSegments: 5
  }
};

export default meta;

export const Default: StoryObj = {
  render: args => {
    const hostRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      const host = hostRef.current;

      if (!host) {
        return;
      }

      const renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      const camera = new PerspectiveCamera(40, 1, 0.1, 100);
      const control = new OrbitControls(camera, renderer.domElement);
      const helper = new PlaneHelper(new Plane(new Vector3(0, 1, 0), 1), 300, 0x000000);
      const scene = new Scene();
      const lightA = new DirectionalLight(0xffffff, 3);
      const lightB = new AmbientLight(0xffffff, 1);
      const geometry = new TreeGeometry({
        generations: args.generations,
        length: args.length,
        uvLength: args.uvLength,
        radius: args.radius,
        radiusSegments: args.radiusSegments,
        heightSegments: args.heightSegments,
      });
      const material = new MeshStandardMaterial({ color: 0x994400, side: DoubleSide, wireframe: false });
      const mesh = new Mesh(geometry, material);

      // Рендер
      const renderLoop = () => {
        requestAnimationFrame(renderLoop);
        control.update();
        renderer.render(scene, camera);
      };

      // Изменение размера
      const onResize = () => {
        const { width, height } = host.getBoundingClientRect();
        const ratio = window.devicePixelRatio ?? 1;

        renderer.setSize(width / ratio, height / ratio, false);
        renderer.setPixelRatio(ratio);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(onResize);

      host.appendChild(renderer.domElement);
      host.style.width = "calc(100svw - 2rem)";
      host.style.height = "calc(100svh - 2rem)";
      resizeObserver.observe(host);
      control.target.set(controlTarget.x, controlTarget.y, controlTarget.z);
      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      camera.far = 900;
      lightA.position.set(0, 0.5, 1).normalize();
      scene.background = new Color(0xffffff);
      mesh.position.set(0, 0, 0);
      scene.add(mesh, lightA, lightB, helper);

      renderLoop();

      return () => {
        host.removeChild(renderer.domElement);
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    });

    return <div ref={hostRef} />;
  }
};