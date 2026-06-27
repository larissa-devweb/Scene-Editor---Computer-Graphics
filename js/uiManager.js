import * as THREE from "three";

import {
    getSelectedObject
}
from "./sceneManager.js";

/* =========================
   CAMPOS HTML
========================= */

const posX =
document.getElementById("posX");

const posY =
document.getElementById("posY");

const posZ =
document.getElementById("posZ");

const rotX =
document.getElementById("rotX");

const rotY =
document.getElementById("rotY");

const rotZ =
document.getElementById("rotZ");

const scaleX =
document.getElementById("scaleX");

const scaleY =
document.getElementById("scaleY");

const scaleZ =
document.getElementById("scaleZ");

const selectedName =
document.getElementById(
    "selectedName"
);

const applyButton =
document.getElementById(
    "applyTransform"
);

/* =========================
   ATUALIZA CAMPOS
========================= */

export function updateUI(){

    const obj =
    getSelectedObject();

    if(!obj)
    return;

    selectedName.value =
    obj.userData.modelName ||
    "Objeto";

    posX.value =
    obj.position.x.toFixed(2);

    posY.value =
    obj.position.y.toFixed(2);

    posZ.value =
    obj.position.z.toFixed(2);

    rotX.value =
    THREE.MathUtils
    .radToDeg(
        obj.rotation.x
    ).toFixed(2);

    rotY.value =
    THREE.MathUtils
    .radToDeg(
        obj.rotation.y
    ).toFixed(2);

    rotZ.value =
    THREE.MathUtils
    .radToDeg(
        obj.rotation.z
    ).toFixed(2);

    scaleX.value =
    obj.scale.x.toFixed(2);

    scaleY.value =
    obj.scale.y.toFixed(2);

    scaleZ.value =
    obj.scale.z.toFixed(2);

}

/* =========================
   APLICAR
========================= */

applyButton.addEventListener(
    "click",

    ()=>{

        const obj =
        getSelectedObject();

        if(!obj){

            alert(
                "Selecione um objeto"
            );

            return;
        }

        obj.position.set(

            Number(posX.value),

            Number(posY.value),

            Number(posZ.value)

        );

        obj.rotation.set(

            THREE.MathUtils.degToRad(
                Number(rotX.value)
            ),

            THREE.MathUtils.degToRad(
                Number(rotY.value)
            ),

            THREE.MathUtils.degToRad(
                Number(rotZ.value)
            )

        );

        obj.scale.set(

            Number(scaleX.value),

            Number(scaleY.value),

            Number(scaleZ.value)

        );

    }
);