/**
 * License: MIT
 *
 * long description for the file
 *
 * @summary short description for the file
 * @author Alberto Valero <https://github.com/avalero>
 *
 * Created at     : 2019-01-15 16:22:05
 * Last modified  : 2019-01-16 16:01:54
 */

import isEqual from 'lodash.isequal';
import * as THREE from 'three';
import ObjectsCommon, {
  IObjectsCommonJSON,
  IViewOptions,
  OperationsArray,
} from './ObjectsCommon';
import PrimitiveObject from './PrimitiveObject';

import gentilis_regular from './fonts/gentilis_regular.typeface.json';
import gentilis_bold from './fonts/gentilis_bold.typeface.json';
import helvetiker_bold from './fonts/helvetiker_bold.typeface.json';
import helvetiker_regular from './fonts/helvetiker_regular.typeface.json';
import optimer_bold from './fonts/optimer_bold.typeface.json';
import optimer_regular from './fonts/optimer_regular.typeface.json';

export interface ITextObjectParams {
  text: string;
  thickness: number;
  size: number;
  font: string;
}

export interface ITextObjectJSON extends IObjectsCommonJSON {
  parameters: ITextObjectParams;
}

export default class TextObject extends PrimitiveObject {
  public static typeName: string = 'TextObject';

  public static newFromJSON(object: ITextObjectJSON): TextObject {
    if (object.type !== TextObject.typeName) {
      throw new Error('Not Text Object');
    }
    const text = new TextObject(
      object.parameters,
      object.operations,
      object.viewOptions,
    );
    text.id = object.id || '';

    return text;
  }

  constructor(
    parameters: Partial<ITextObjectParams>,
    operations: OperationsArray = [],
    viewOptions: Partial<IViewOptions> = ObjectsCommon.createViewOptions(),
    mesh?: THREE.Mesh | undefined,
  ) {
    const vO = {
      ...ObjectsCommon.createViewOptions(),
      ...viewOptions,
    };
    super(vO, operations);
    this.type = TextObject.typeName;
    const params = {
      font: 'gentilis_regular',
      ...parameters,
    };
    this.setParameters(params);
    this.lastJSON = this.toJSON();
    if (mesh) {
      this.setMesh(mesh);
    } else {
      this.meshPromise = this.computeMeshAsync();
    }
  }

  public clone(): TextObject {
    if (this.mesh && isEqual(this.lastJSON, this.toJSON())) {
      const objText = new TextObject(
        this.parameters as ITextObjectParams,
        this.operations,
        this.viewOptions,
        (this.mesh as THREE.Mesh).clone(),
      );
      return objText;
    }
    const obj = new TextObject(
      this.parameters as ITextObjectParams,
      this.operations,
      this.viewOptions,
    );
    return obj;
  }

  protected getGeometry(): THREE.Geometry {
    let { text, thickness, size } = this.parameters as ITextObjectParams;
    thickness = Math.max(0.1, thickness);
    size = Math.max(0.1, size);
    text = text || 'TEXT';

    let font: THREE.Font;
    try {
      switch ((this.parameters as ITextObjectParams).font) {
        case 'gentilis_regular':
          font = new THREE.Font(gentilis_regular);
          break;
        case 'gentilis_bold':
          font = new THREE.Font(gentilis_bold);
          break;
        case 'helvetiker_bold':
          font = new THREE.Font(helvetiker_bold);
          break;
        case 'helvetiker_regular':
          font = new THREE.Font(helvetiker_regular);
          break;
        case 'optimer_bold':
          font = new THREE.Font(optimer_bold);
          break;
        case 'optimer_regular':
          font = new THREE.Font(optimer_regular);
          break;
        default:
          font = new THREE.Font(gentilis_regular);
      }
    } catch (e) {
      throw new Error(
        `Cannot create font ${
          (this.parameters as ITextObjectParams).font
        }: ${e}`,
      );
    }

    this._meshUpdateRequired = false;
    try {
      const geom = new THREE.TextGeometry(text, {
        size,
        font,
        height: thickness,
      });

      return geom;
    } catch (e) {
      throw new Error(`Cannot create ${this.getTypeName()} geometry: ${e}`);
    }
  }
}