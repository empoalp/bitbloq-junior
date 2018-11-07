import * as THREE from 'three';
import {Object3D, OperationsArray} from './Object3D';
//import cloneDeep from 'lodash.clonedeep';

export default class ObjectsGroup{
   private group:Array<Object3D>;
   private operations: OperationsArray;

   constructor(objects: Array<Object3D>){
     this.group = objects;
   }
   // Group operations. Will be transferred to children only when un-grouped.
   public setOperations(operations: OperationsArray = []):void{
      this.operations = [];
      this.operations = operations.slice();
   }

   // When a group is un-grouped all the operations of the group are transferred to the single objects
   // Return the array of objects with all the inherited operations of the group.
   public unGroup():Array<Object3D>{
    this.group.forEach( object3D => {
      object3D.addOperations(this.operations);
    });
    return this.group;
   }

   public getMeshAsync():Promise<THREE.Group> {
    return new Promise( (resolve, reject) => {
      const meshGroup: THREE.Group = new THREE.Group();

      // Operations must be applied to the single objects, but they are not transferred whilst they are grouped.
      if(this.group.length === 0){
        reject('No item in group');
        return;
      }

      const promises: Promise<THREE.Mesh>[] = []

      this.group.forEach( object3D => {
        // only first level objets require to update operations, no need to make deep copy  
        const objectClone:Object3D = Object.assign(
          Object.create(
            Object.getPrototypeOf(object3D)
          ),
          object3D); // cloneDeep(object3D); is it need to use cloneDeep???
          
        objectClone.addOperations(this.operations);
        promises.push(objectClone.getMeshAsync());
      });

      Promise.all(promises).then(meshes => {
        meshes.forEach(mesh => {
          meshGroup.add(mesh);
        });
        resolve(meshGroup);
      });
    });
  }
}