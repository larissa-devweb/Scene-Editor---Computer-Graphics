import * as THREE from "three";
import "./saveLoad.js";
import { TransformControls }
from "three/addons/controls/TransformControls.js";

import { OrbitControls }
from "three/addons/controls/OrbitControls.js";

import { OBJLoader }
from "three/addons/loaders/OBJLoader.js";
import { MTLLoader }
from "three/addons/loaders/MTLLoader.js";

import {
    sceneObjects,
    setSelectedObject,
    addSceneObject,
    getSelectedObject
}
from "./sceneManager.js";

import {
    updateUI
}
from "./uiManager.js";

let selectionHelper = null;

// CENA

const canvas =
document.getElementById("webgl");

const scene =
new THREE.Scene();

scene.background =
new THREE.Color(0xfff8fc);

// RENDERER
const renderer =
new THREE.WebGLRenderer({
    canvas,
    antialias: true
});

//CAMERA
const camera =
new THREE.PerspectiveCamera(
    60,
    1,
    0.1,
    1000
);

camera.position.set(
    8,
    8,
    8
);

//CONTROLES
const controls =
new OrbitControls(
    camera,
    renderer.domElement
);

controls.mouseButtons = {
    LEFT: null,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
};

controls.enablePan = true;

//Movimentar objeto com mouse
const transformControls =
new TransformControls(
    camera,
    renderer.domElement
);

scene.add(transformControls);


controls.enableDamping = true;

controls.target.set(
    0,
    0,
    0
);

controls.update();

// LUZES

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        4
    )
);

const light =
new THREE.DirectionalLight(
    0xffffff,
    5
);

light.position.set(
    10,
    20,
    10
);

scene.add(light);

//GRID
scene.add(
    new THREE.GridHelper(
        50,
        50,
         0x666666,
      //0xff99cc,
    0xffcce5
    )
);
/*
//CUBO TESTE
const cube =
new THREE.Mesh(

    new THREE.BoxGeometry(1,1,1),

    new THREE.MeshStandardMaterial({
        color:0xff69b4
    })

);

cube.position.set(
    -4,
    0.5,
    0
);

scene.add(cube);*/

//RESIZE
function resize(){

    const viewport =
    document.getElementById(
        "viewport"
    );

    const width =
    viewport.clientWidth;

    const height =
    viewport.clientHeight;

    renderer.setSize(
        width,
        height
    );

    camera.aspect =
    width / height;

    camera.updateProjectionMatrix();
}

resize();

window.addEventListener(
    "resize",
    resize
);

//OBJ LOADER
const objLoader =
new OBJLoader();

const mtlLoader =
new MTLLoader();

const modelCache = {};
//const clone = modelCache[name].clone();


//MODELOS

export async function addModel(name){

    mtlLoader.setResourcePath(
        "../Assets/obj/"
    );

if(modelCache[name]){

    const clone =
    modelCache[name].clone(true);

    clone.position.set(0,0,0);

    scene.add(clone);

    addSceneObject(clone);

    updateParentList();

    setSelectedObject(clone);

    transformControls.attach(clone);

    return;
}

    mtlLoader.load(

        `../Assets/obj/${name}.mtl`,

        (materials)=>{

            materials.preload();

            objLoader.setMaterials(
                materials
            );

            objLoader.load(

                `../Assets/obj/${name}.obj`,

                (obj)=>{

                    console.log(
                        "Modelo carregado:",
                        name
                    );

                    const box =
                    new THREE.Box3()
                    .setFromObject(obj);
                    const minY = box.min.y;

                    const center =
                    new THREE.Vector3();

                    box.getCenter(center);


                    const size =
                    new THREE.Vector3();

                    box.getSize(size);

                    const maxDimension =
                    Math.max(
                        size.x,
                        size.y,
                        size.z
                    );

                    const scale =
                    2 / maxDimension;

                    obj.scale.set(
                        scale,
                        scale,
                        scale
                    );


obj.position.set(
    0,
    -minY * scale,
    0
);

obj.traverse((child)=>{

    if(child.isMesh){

        child.material.transparent = false;

        child.material.opacity = 1;

        child.material.alphaTest = 0;

        child.material.depthWrite = true;

        child.material.needsUpdate = true;

        // Guarda a textura original para poder reusar
            if (!obj.userData.originalTexture) {
                obj.userData.originalTexture = child.material.map;
                obj.userData.originalMaterial = child.material.clone();
            }

    }

});

obj.userData.modelName = name;
modelCache[name] = obj.clone(true);
obj.userData.originalMaterials = [];

obj.traverse((child)=>{

    if(child.isMesh){

        const materials =
        Array.isArray(child.material)
        ? child.material
        : [child.material];

        obj.userData.originalMaterials.push(

            materials.map(mat => mat.clone())

        );

    }

});

obj.userData.selectable = true;

obj.userData.velocity = {
    x: 0,
    y: 0,
    z: 0
};


scene.add(obj);
addSceneObject(obj);
updateParentList(); //hierarquia
setSelectedObject(obj);
transformControls.attach(obj);

console.log(
    "Selecionado:",
    obj.userData.modelName
);

updateUI();

controls.target.set(
    0,
    0,
    0
);

controls.update();

}, 
                undefined,

                (error)=>{

                    console.error(
                        error
                    );

                    alert(
                        `Erro OBJ: ${name}`
                    );

                }
            );

        },

        undefined,

        (error)=>{

            console.error(
                error
            );

            alert(
                `Erro MTL: ${name}`
            );

        }
    );
}


//BOTÕES

document
.querySelectorAll(".modelButton")
.forEach((button)=>{

    button.addEventListener(
        "click",
        ()=>{

            const model =
            button.dataset.model;

            addModel(model);

        }
    );

});

//COR OBJETO

const colorPicker =
document.getElementById(
    "objectColor"
);

if(colorPicker){

    colorPicker.addEventListener(
        "input",
        ()=>{

            const selectedObject =
            getSelectedObject();

        if(!selectedObject)
        return;


            selectedObject.traverse(
                (child)=>{

                    if(child.isMesh){

                        if(Array.isArray(
                            child.material
                        )){

                            child.material.forEach(
                                (mat)=>{

                                    if(mat.color){

                                        mat.color.set(
                                            colorPicker.value
                                        );

                                    }

                                }
                            );

                        }
                        else{

                            if(child.material.color){

                                child.material.color.set(
                                    colorPicker.value
                                );

                            }

                        }

                    }

                }
            );

        }
    );

}

// TRANSFORMAÇÕES

const posX = document.getElementById("posX");
const posY = document.getElementById("posY");
const posZ = document.getElementById("posZ");

const rotX = document.getElementById("rotX");
const rotY = document.getElementById("rotY");
const rotZ = document.getElementById("rotZ");

const scaleX = document.getElementById("scaleX");
const scaleY = document.getElementById("scaleY");
const scaleZ = document.getElementById("scaleZ");

posX.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    obj.position.x =
    Number(posX.value);

});

posY.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    obj.position.y =
    Number(posY.value);

});

posZ.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    obj.position.z =
    Number(posZ.value);

});

//rotaçao

rotX.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    obj.rotation.x =
    THREE.MathUtils.degToRad(
        Number(rotX.value)
    );

});

rotY.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    obj.rotation.y =
    THREE.MathUtils.degToRad(
        Number(rotY.value)
    );

});

rotZ.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    obj.rotation.z =
    THREE.MathUtils.degToRad(
        Number(rotZ.value)
    );

});

//escala

scaleX.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    obj.scale.x =
    Number(scaleX.value);

});

scaleY.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    obj.scale.y =
    Number(scaleY.value);

});

scaleZ.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    obj.scale.z =
    Number(scaleZ.value);

});

//ANIMAÇAO E VELOCIDADE

const speedX =
document.getElementById("speedX");

const speedY =
document.getElementById("speedY");

const speedZ =
document.getElementById("speedZ");


const applyAnimation =
document.getElementById(
    "applyAnimation"
);

applyAnimation.addEventListener(
    "click",
    ()=>{

        const obj =
        getSelectedObject();

        if(!obj) return;

        obj.userData.velocity = {

            x: Number(speedX.value),
            y: Number(speedY.value),
            z: Number(speedZ.value)

        };

    }
);

const stopAnimation =
document.getElementById(
    "stopAnimation"
);

stopAnimation.addEventListener(
    "click",
    ()=>{

        const obj =
        getSelectedObject();

        if(!obj) return;

        obj.userData.velocity = {
            x: 0,
            y: 0,
            z: 0
        };

    }
);

//para deletar modelo

const deleteButton =
document.getElementById(
    "deleteObject"
);


deleteButton.addEventListener(
    "click",
    ()=>{

        const obj =
        getSelectedObject();

        if(!obj)
            return;

        // Remove da cena
       //scene.remove(obj);
        obj.removeFromParent(); 

        // Remove da lista de objetos
        const index =
        sceneObjects.indexOf(obj);

        if(index !== -1){

            sceneObjects.splice(index,1);

        }

        // Remove o contorno verde
        if(selectionHelper){

            scene.remove(selectionHelper);
            selectionHelper = null;

        }

        // Remove 
        transformControls.detach();

        // Limpa seleção
        setSelectedObject(null);

        // Atualiza lista de pais
        updateParentList();

        updateUI();

    }
);

//para hierarquia

const parentSelect =
document.getElementById("parentSelect");

const applyParent =
document.getElementById("applyParent");

const removeParent =
document.getElementById("removeParent");

function updateParentList(){

    parentSelect.innerHTML =
    '<option value="">Nenhum</option>';

    sceneObjects.forEach((obj,index)=>{

        const option =
        document.createElement("option");

        option.value = index;

        option.textContent =
        obj.userData.modelName + " " + index;

        parentSelect.appendChild(option);

    });

}

applyParent.addEventListener(
    "click",
    ()=>{

        const child = getSelectedObject();

        if(!child)
            return;

        const index = parentSelect.value;

        // Remover hierarquia
        if(index === ""){

    scene.attach(child);

            updateParentList();
            updateUI();

            return;
        }

        const parent = sceneObjects[index];

        if(!parent)
            return;

        if(parent === child) 
            return;

      parent.attach(child);

        updateParentList();

    }
);

removeParent.addEventListener("click", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

console.log("Objeto selecionado:", obj);
  //console.log("Pai atual:", obj.parent);
  //console.log("É filho da cena?", obj.parent === scene);

    if(obj.parent === scene)
      console.log("O objeto já está na cena.");
        return;

    scene.attach(obj);

    updateParentList();

});

//TEXTURAS 

const textureSelect =
document.getElementById(
    "textureSelect"
);
const roughnessInput = document.getElementById("roughness");

const metalnessInput =document.getElementById("metalness");
//repeat é duplicar textura, ao inves de esticar
const repeatX =document.getElementById("repeatX");
const repeatY =document.getElementById("repeatY");
const texRotation =document.getElementById("texRotation");
const opacity =document.getElementById("opacity");

if(textureSelect){

    textureSelect.addEventListener(
        "change",
        ()=>{

            const obj =  getSelectedObject();

            if(!obj)
            return;

            if(textureSelect.value === "original"){

    let index = 0;

    obj.traverse((child)=>{

        if(!child.isMesh) return;

        const originals =  obj.userData.originalMaterials[index];

        if(Array.isArray(child.material)){

            child.material =  originals.map(mat => mat.clone());

        }
        else{

            child.material = originals[0].clone();

        }

        index++;

    });

    return;
}

let color;

switch(textureSelect.value){

    case "chocolate":
        color = 0x6b3e26;
        break;

    case "morango":
        color = 0xff5c8a;
        break;

    case "glace":
        color = 0xfff5f8;
        break;
}

obj.traverse((child)=>{

    if(!child.isMesh) return;

    const materials =
    Array.isArray(child.material)
    ? child.material
    : [child.material];

    materials.forEach(mat=>{

    if(mat.color){
        mat.color.set(color);
    }

  mat.roughness = Number(roughnessInput.value);

mat.needsUpdate = true;

    if(mat.map){
     /* mat.map.wrapS =
        THREE.RepeatWrapping;

        mat.map.wrapT =
        THREE.RepeatWrapping;

      mat.map.repeat.set(
            Number(repeatX.value),
            Number(repeatY.value)
        );*/

        mat.map.center.set(
            0.5,
            0.5
        );

        mat.map.rotation =
        THREE.MathUtils.degToRad(
            Number(texRotation.value)
        );

        mat.map.needsUpdate = true;
    }

});

});

}); 

} //textureSelect

//opacidade

opacity.addEventListener("input", ()=>{

    const obj = getSelectedObject();

    if(!obj) return;

    const value = Number(opacity.value);

    obj.traverse((child)=>{

        if(!child.isMesh) return;

        const materials =
            Array.isArray(child.material)
            ? child.material
            : [child.material];

        materials.forEach(mat=>{

            mat.opacity = value;

            if(value >= 0.99){

                // volta ao estado original
                mat.transparent = false;
                mat.opacity = 1;
                mat.depthWrite = true;

            }else{

                mat.transparent = true;
                mat.depthWrite = false;

            }

            mat.needsUpdate = true;

        });

    });

});

// CLIQUE 

const raycaster =
new THREE.Raycaster();

const mouse =
new THREE.Vector2();


window.addEventListener(
    "click",
    (event)=>{

        const rect =
        renderer.domElement.getBoundingClientRect();

        mouse.x =
        ((event.clientX - rect.left)
        / rect.width) * 2 - 1;

        mouse.y =
        -((event.clientY - rect.top)
        / rect.height) * 2 + 1;

        raycaster.setFromCamera(
            mouse,
            camera
        );


const intersects =
raycaster.intersectObjects(
    scene.children,
    true
).filter(hit => {

    let current = hit.object;

    while(current.parent){

        if(current.userData.selectable)
            return true;

        current = current.parent;
    }

    return false;
});
        if(intersects.length > 0){


    let obj = intersects[0].object;

while(
    obj &&
    !obj.userData.selectable
){
    obj = obj.parent;
}

if(!obj)
    return; 

            setSelectedObject(obj);

            if(selectionHelper){

    scene.remove(
        selectionHelper
    );

}

selectionHelper =
new THREE.BoxHelper(
   obj,
    0x00ff00
);
selectionHelper.userData.selectable = false;

scene.add(
    selectionHelper
);

            updateUI();

            console.log(
    "Selecionado:",
    obj
);

        }

    }
);

window.addEventListener(
    "keydown",
    (e)=>{

        if(e.key==="g")
            transformControls.setMode("translate");

        if(e.key==="r")
            transformControls.setMode("rotate");

        if(e.key==="s")
            transformControls.setMode("scale");

    }
);

function animate(){

    requestAnimationFrame(
        animate
    );

    controls.update();

    scene.traverse((obj)=>{

        if(obj.userData.velocity){

            obj.position.x +=
            obj.userData.velocity.x;

            obj.position.y +=
            obj.userData.velocity.y;

            obj.position.z +=
            obj.userData.velocity.z;

        }

    });

    renderer.render(
        scene,
        camera
    );

}
animate();
