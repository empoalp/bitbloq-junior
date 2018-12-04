import * as THREE from 'three';
import Scene, {IHelperDescription} from './Scene';
import ObjectsCommon from './ObjectsCommon';
import OrbitCamera from './OrbitCamera';

type ClickHandler = (object?: any) => void;

export interface RendererOptions {
  antialias: boolean;
  clearColor: number;
  sortObjects: boolean;
}

export default class Renderer {
  public static defaultOptions: RendererOptions = {
    antialias: true,
    clearColor: 0xfafafa,
    sortObjects: false,
  };

  private options: RendererOptions;
  private threeRenderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private perspectiveCamera: THREE.PerspectiveCamera;
  private ortographicCamera: THREE.OrthographicCamera;
  private cameraControls: OrbitCamera;
  private scene: Scene;
  private threeScene: THREE.Scene;
  private objectsGroup: THREE.Group;
  private objectInTransition: THREE.Mesh | undefined;
  private helpersGroup: THREE.Group;
  private sceneSetupGroup: THREE.Group;
  private container: HTMLElement;
  private wrapElement: HTMLElement;
  private navBoxContainer: HTMLElement;

  constructor(
    scene: Scene,
    container: HTMLElement,
    options: Partial<RendererOptions> = {},
  ) {
    this.scene = scene;
    this.container = container;

    this.options = {
      ...options,
      ...Renderer.defaultOptions,
    };

    this.setup();
    this.renderLoop();
  }

  private setup() {
    const rendererParams = {
      antialias: this.options.antialias,
      sortObjects: this.options.sortObjects,
    };

    const threeRenderer = new THREE.WebGLRenderer(rendererParams);
    threeRenderer.setClearColor(this.options.clearColor);
    this.threeRenderer = threeRenderer;
    this.container.appendChild(threeRenderer.domElement);

    this.threeScene = new THREE.Scene();

    this.helpersGroup = new THREE.Group();
    this.threeScene.add(this.helpersGroup);

    this.sceneSetupGroup = this.scene.getSceneSetup();
    this.threeScene.add(this.sceneSetupGroup);

    this.clock = new THREE.Clock();

    this.perspectiveCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    this.perspectiveCamera.position.set(0, -150, 80);
    this.perspectiveCamera.up.set(0, 0, 1);
    this.perspectiveCamera.lookAt(this.threeScene.position);

    this.cameraControls = new OrbitCamera(
      this.perspectiveCamera,
      this.threeRenderer.domElement,
    );
  }

  private updateSize() {
    const containerRect = this.container.getBoundingClientRect();
    const {width, height} = containerRect;
    this.threeRenderer.setSize(width, height);
    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();
  }

  private renderLoop = () => {
    this.updateSize();
    const delta = this.clock.getDelta();
    const cameraNeedsUpdate = this.cameraControls.update(delta);

    if (cameraNeedsUpdate) {
      // TODO: Update navigation box camera
    }
 
    requestAnimationFrame(this.renderLoop);

    this.threeRenderer.render(this.threeScene, this.perspectiveCamera);
  };

  public async updateScene(): Promise<void> {
    //objects in transition

    const  newObjectInTranstion: THREE.Mesh | undefined = await this.scene.getObjectInTransitionAsync()
    if(newObjectInTranstion){
      if(this.objectInTransition) this.threeScene.remove(this.objectInTransition);
      this.objectInTransition = newObjectInTranstion;
      (this.objectInTransition.material as THREE.MeshLambertMaterial).opacity = 0.5;
      (this.objectInTransition.material as THREE.MeshLambertMaterial).transparent = true;
      (this.objectInTransition.material as THREE.MeshLambertMaterial).depthWrite = false;
      this.threeScene.add(this.objectInTransition);
    }

    const newObjectsGroup = await this.scene.getObjectsAsync();
    this.threeScene.remove(this.objectsGroup);
    if(this.objectInTransition){ 
      this.threeScene.remove(this.objectInTransition);
      (this.objectInTransition as any) = undefined;
    }

    this.threeScene.add(newObjectsGroup);
    this.objectsGroup = newObjectsGroup;  
  }

  public async setActiveHelper(
    activeOperation: IHelperDescription,
  ): Promise<void> {
    while (this.helpersGroup.children.length > 0) {
      this.helpersGroup.remove(this.helpersGroup.children[0]);
    }
    const helpers = await this.scene.setActiveHelperAsync(activeOperation);
    helpers.forEach(helper => this.helpersGroup.add(helper));
  }

  public updateCameraAngle(theta: number, phi: number) {
    this.cameraControls.rotateTo(theta, phi, true);
  }

  public zoomIn(): void {}

  public zoomOut(): void {}

  public setOrtographicCamera(isOrtographic: boolean): void {}

  private handleClick(e: MouseEvent, handler: ClickHandler) {}

  public onClick(handler: ClickHandler): void {
    this.container.addEventListener('click', e => this.handleClick(e, handler));
  }
}
