export const sceneObjects = [];

let selectedObject = null;

export function addSceneObject(obj){

    sceneObjects.push(obj);

}

export function setSelectedObject(obj){

    selectedObject = obj;

}

export function getSelectedObject(){

    return selectedObject;

}