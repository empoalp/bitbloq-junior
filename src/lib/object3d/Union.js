import * as Three from 'three';

import CompoundObject from './CompoundObject';
import { ThreeBSP } from './threeCSG';

export default class Union extends CompoundObject {
  getGeometry() {
    // First element of array
    let unionMeshBSP = new ThreeBSP(this.children[0].getGeometry());

    // Union with the rest
    for (let i = 1; i < this.children.length; i += 1) {
      const bspMesh = new ThreeBSP(this.children[i].getGeometry());
      unionMeshBSP = unionMeshBSP.union(bspMesh);
    }

    console.log('compute union');
    return unionMeshBSP.toGeometry();
  }
}