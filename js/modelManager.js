import * as THREE from "three";

import { scene }
from "./main.js";

import { OBJLoader }
from "three/addons/loaders/OBJLoader.js";

import { MTLLoader }
from "three/addons/loaders/MTLLoader.js";

const objLoader =
new OBJLoader();

const mtlLoader =
new MTLLoader();

export const loadedModels = {};

export const sceneObjects = [];

export function loadModel(name){

return new Promise((resolve)=>{

if(loadedModels[name]){

resolve(
loadedModels[name]
);

return;
}

mtlLoader.load(

`Assets/obj/${name}.mtl`,

(materials)=>{

materials.preload();

objLoader.setMaterials(
materials
);

objLoader.load(

`Assets/obj/${name}.obj`,

(obj)=>{

loadedModels[name]=obj;

resolve(obj);

}

);

}

);

});

}

export async function addModel(name){

const original =
await loadModel(name);

const clone =
original.clone();

clone.position.set(
0,
0,
0
);

clone.userData.modelName =
name;

scene.add(clone);

sceneObjects.push(clone);

return clone;

}