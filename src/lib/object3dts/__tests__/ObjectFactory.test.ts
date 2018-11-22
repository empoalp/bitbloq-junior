import Cube from '../Cube';
import Cylinder from '../Cylinder';
import ObjectFactory from '../ObjectFactory';
import Sphere from '../Sphere';
import Prism from '../Prism';
import ObjectsCommon from '../ObjectsCommon';
import Scene from '../Scene';
import ObjectsGroup, { IObjectsGroupJSON } from '../ObjectsGroup';

const width = 10;
const height = 20;
const depth = 30;

const r0 = 4;
const r1 = 6;
const radius = 8;

const sides = 5;
const length = 3;

test('Check Cube is well created from ObjectFactory', () => {
  const object1 = new Cube({ width, height, depth },[],ObjectsCommon.createViewOptions(), new Scene());
  const json = object1.toJSON();
  const object: Cube = ObjectFactory.newFromJSON(json, new Scene()) as Cube;
  expect((object as any).parameters.width).toBe(width);
  expect((object as any).parameters.height).toBe(height);
  expect((object as any).parameters.depth).toBe(depth);
  expect(object1.getID()).not.toEqual(object.getID());
});

test('Check Cylinder is well created from ObjectFactory', () => {
  const object1 = new Cylinder({ r0, r1, height },[],ObjectsCommon.createViewOptions(), new Scene());
  const json = object1.toJSON();
  const object: Cylinder = ObjectFactory.newFromJSON(json, new Scene()) as Cylinder;
  expect((object as any).parameters.r0).toBe(r0);
  expect((object as any).parameters.height).toBe(height);
  expect((object as any).parameters.r1).toBe(r1);
  expect(object1.getID()).not.toEqual(object.getID());
});

test('Check Sphere is well created from ObjectFactory', () => {
  const object1 = new Sphere({ radius },[],ObjectsCommon.createViewOptions(), new Scene());
  const json = object1.toJSON();
  const object = ObjectFactory.newFromJSON(json, new Scene());
  expect((object as any).parameters.radius).toBe(radius);
  expect(object1.getID()).not.toEqual(object.getID());
});

test('Check Prism is well created from ObjectFactory', () => {
  const object1 = new Prism({ sides, length, height },[],ObjectsCommon.createViewOptions(), new Scene());
  const json = object1.toJSON();
  const object = ObjectFactory.newFromJSON(json, new Scene());
  expect((object as any).parameters.sides).toBe(sides);
  expect((object as any).parameters.height).toBe(height);
  expect((object as any).parameters.length).toBe(length);
  expect(object1.getID()).not.toEqual(object.getID());
});


test('Check ObjectsGroup is well created from ObjectFactory', () => {
  const scene = new Scene();
  
  const objectCubeAux = new Cube({ width, height, depth },[],ObjectsCommon.createViewOptions(), new Scene());
  const jsonCubeAux = objectCubeAux.toJSON();
  const jsonCube = scene.addNewObjectFromJSON(jsonCubeAux);
  

  const objectPrismAux = new Prism({ sides, length, height },[],ObjectsCommon.createViewOptions(), new Scene());
  const jsonPrismAux = objectPrismAux.toJSON();
  const jsonPrism = scene.addNewObjectFromJSON(jsonPrismAux);

  const jsonGroupAux:IObjectsGroupJSON = {
    group: [jsonCube, jsonPrism],
    id: '',
    type: ObjectsGroup.typeName,
    viewOptions: ObjectsCommon.createViewOptions(),
    operations: [],
  }

  const group = ObjectFactory.newFromJSON(jsonGroupAux, scene);

  expect((group as any).group.length).toEqual(2);
  expect((group as any).group[0].id).toEqual(jsonCube.id);
  expect((group as any).group[1].id).toEqual(jsonPrism.id);

});

test('Check ObjectsGroup rejects object not in Scene from ObjectFactory', () => {
  const scene = new Scene();
  
  const objectCubeAux = new Cube({ width, height, depth },[],ObjectsCommon.createViewOptions(), new Scene());
  const jsonCubeAux = objectCubeAux.toJSON();
  const jsonCube = scene.addNewObjectFromJSON(jsonCubeAux);
  

  const objectPrismAux = new Prism({ sides, length, height },[],ObjectsCommon.createViewOptions(), new Scene());
  const jsonPrismAux = objectPrismAux.toJSON();
  const jsonPrism = scene.addNewObjectFromJSON(jsonPrismAux);

  const jsonGroupAux:IObjectsGroupJSON = {
    group: [jsonCube, jsonPrism, jsonPrismAux],
    id: '',
    type: ObjectsGroup.typeName,
    viewOptions: ObjectsCommon.createViewOptions(),
    operations: [],
  }

  const error  = () => { ObjectFactory.newFromJSON(jsonGroupAux, scene);}
  expect(error).toThrowError();

});
