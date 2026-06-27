import { sceneObjects }
from "./sceneManager.js";

import { addModel }
from "./main.js";

/* =========================
   SALVAR
========================= */

export function saveScene(){

    const data =
    sceneObjects.map(obj=>({

        name:
        obj.userData.modelName,

        position:{
            x:obj.position.x,
            y:obj.position.y,
            z:obj.position.z
        },

        rotation:{
            x:obj.rotation.x,
            y:obj.rotation.y,
            z:obj.rotation.z
        },

        scale:{
            x:obj.scale.x,
            y:obj.scale.y,
            z:obj.scale.z
        }

    }));

    const json =
    JSON.stringify(
        data,
        null,
        2
    );

    const blob =
    new Blob(
        [json],
        {
            type:"application/json"
        }
    );

    const link =
    document.createElement("a");

    link.href =
    URL.createObjectURL(blob);

    link.download =
    "scene.json";

    link.click();
}

/* =========================
   CARREGAR
========================= */

export async function loadSceneFile(file){

    if(!file)
    return;

    const text =
    await file.text();

    const sceneData =
    JSON.parse(text);

    for(const item of sceneData){

        try{

            const obj =
            await addModel(
                item.name
            );

            if(!obj)
            continue;

            obj.position.set(
                item.position.x,
                item.position.y,
                item.position.z
            );

            obj.rotation.set(
                item.rotation.x,
                item.rotation.y,
                item.rotation.z
            );

            obj.scale.set(
                item.scale.x,
                item.scale.y,
                item.scale.z
            );

        }
        catch(error){

            console.error(
                "Erro carregando:",
                item.name,
                error
            );

        }

    }

}

/* =========================
   EVENTOS HTML
========================= */

const saveButton =
document.getElementById(
    "saveScene"
);

if(saveButton){

    saveButton.addEventListener(
        "click",
        saveScene
    );

}

const loadInput =
document.getElementById(
    "loadScene"
);

if(loadInput){

    loadInput.addEventListener(
        "change",

        (event)=>{

            const file =
            event.target.files[0];

            loadSceneFile(
                file
            );

        }
    );

}