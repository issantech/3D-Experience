import { VctrApi } from "https://www.vectary.com/viewer-api/v1/api.js";

let vctrApi;
let camera0 = document.getElementById("camera0");
let camera1 = document.getElementById("camera1");
let camera2 = document.getElementById("camera2");
let hideBtn = document.getElementById("hide");
let rocketBtn = document.getElementById("rocket");
let baseBtn = document.getElementById("base");

let switchingInProgress = false;
let annotationSwitch = true;
let highlightState = false;

//Const For Color Start Here
const materialSelector = document.getElementById("select_material");
const meshSelector = document.getElementById("select_mesh");
const colorSelector = document.getElementById("select_color");
const applySelectionBtn = document.getElementById("apply_selections");
const propertiesBtn = document.getElementById("properties");
const textureInputElem = document.getElementById("texture-input");

const preloaderElem = document.getElementById("preloader-demo");
const applyTextureBtn = document.getElementById("texture-apply");

const rootDocument = !!document.getElementsByTagName("iframe").length ?
    document.getElementsByTagName("iframe")[0].contentWindow.document :
    document;
// Const for Colors end here

const annotations = [
    {
        label: "1",
        name: "Rocket",
        text: "The spaceship flying around the space base",
        objectName: "Rocket"
    },
    {
        label: "2",
        name: "Asteroid",
        text: "253 Mathilde",
        objectName: "Asteroid_Large"
    },
    {
        label: "3",
        name: "Space Base",
        text: "Advance asteroid mining space base",
        objectName: "Tower"
    },
    {
        label: "4",
        name: "Transmitter",
        text: "Energy transmitter",
        objectName: "Ring_2"
    },
    {
        label: "5",
        name: "Antenna",
        text: "Radio wave antenna",
        objectName: "Antenna"
    }
];

let annotationsIds = [];

function addAnotations() {
    annotations.forEach(async annotation => {
        const currentAnnotation = await vctrApi.addAnnotation(annotation);
        annotationsIds.push(currentAnnotation.id);
    })
}
// function for Colors
function showLoader() {
    preloaderElem.style.display = "initial";
}

function hideLoader() {
    preloaderElem.style.display = "none";
}
// function for Colors ends here

function addListeners() {
    camera0.addEventListener("click", async _event => {
        if (!switchingInProgress) {
            switchingInProgress = true;
            await vctrApi.switchViewAsync("Camera");
            console.log("Camera switched");
            switchingInProgress = false;
        }
    });

    camera1.addEventListener("click", async _event => {
        if (!switchingInProgress) {
            switchingInProgress = true;
            await vctrApi.switchViewAsync("RocketCamera");
            console.log("Camera switched");
            switchingInProgress = false;
        }
    });

    camera2.addEventListener("click", async _event => {
        if (!switchingInProgress) {
            switchingInProgress = true;
            await vctrApi.switchViewAsync("BackCamera");
            console.log("Camera switched");
            switchingInProgress = false;
        }
    });

    rocketBtn.addEventListener("click", async _event => {
        if (!highlightState && annotationSwitch) {
            await vctrApi.highlightMeshesByName(["Rocket"], "#fcba03", 0.8, false);
            await vctrApi.expandAnnotationsById(annotationsIds[0], true, true);
            highlightState = true;
        } else {
            await vctrApi.unhighlightMeshesByName(["Rocket"]);
            await vctrApi.expandAnnotationsById(annotationsIds[0], false, false);
            highlightState = false;
        }
    });

    hideBtn.addEventListener("click", async _event => {
        annotationSwitch = !annotationSwitch;
        await vctrApi.enableAnnotations(annotationSwitch);
    });

    baseBtn.addEventListener("click", async _event => {
        await vctrApi.expandAnnotationsById([annotationsIds[3], annotationsIds[4]], true, true);
    });

    //Event listener for Colors Start here
    rootDocument.addEventListener("click", async _event => {
        const objectsHit = await vctrApi.getHitObjects();
        if (objectsHit.length) {
            selectByName(meshSelector, objectsHit[0].name);
            selectByName(materialSelector, objectsHit[0].material);
        }

    });

    meshSelector.addEventListener("change", async _event => {
        const selectedMesh = await vctrApi.getMeshByName(meshSelector.value);
        if (selectedMesh) {
            selectByName(materialSelector, selectedMesh.material);
        }
    });

    applySelectionBtn.addEventListener("click", async _event => {
        console.log(`Applying ${materialSelector.value} material onto ${meshSelector.value}`);
        const changeMaterialSuccess = await vctrApi.setMaterial(meshSelector.value, materialSelector.value);
        console.log(`Material change success: ${changeMaterialSuccess}`);

        if (colorSelector.value !== "no-change") {
            const colorChangeResult = await vctrApi.updateMaterial(materialSelector.value, { color: colorSelector.value });

            console.log("Color change success:", colorChangeResult);
        }
    });

    propertiesBtn.addEventListener("click", async _event => {
        console.log(`Applying ${materialSelector.value} material onto ${meshSelector.value}`);
        const props = await vctrApi.getMaterialProperties(materialSelector.value);
        console.log(`Properties of ${materialSelector.value}: `, props);
    });

    applyTextureBtn.addEventListener("click", async _event => {
        if (!textureInputElem.value) {
            return;
        }

        console.log(`Applying ${textureInputElem.value} texture onto ${meshSelector.value}`);

        showLoader();

        await vctrApi.updateMaterial(materialSelector.value, { map: textureInputElem.value });

        hideLoader();
    });

    // Event Listener for Colors end here
}

// External function
function addOptionsToSelector(names, htmlSelectElem) {
    names.forEach((name) => {
        const newOption = document.createElement("option");
        newOption.value = name;
        newOption.innerText = name;

        htmlSelectElem.appendChild(newOption);
    });
}

function selectByName(htmlSelectElem, value) {
    const options = htmlSelectElem.getElementsByTagName("option");
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === value) {
            options[i].selected = true;
        }
    }
}

// External function ends here



async function run() {
    console.log("Example script running..");

    function errHandler(err) {
        console.log("API error", err);
    }

    async function onReady() {
        console.log("API ready..");
        console.log(await vctrApi.getObjects());

        const allMaterials = await vctrApi.getMaterials();
        const allMeshes = await vctrApi.getMeshes();
        addOptionsToSelector(allMaterials.map(mat => mat.name), materialSelector);
        addOptionsToSelector(allMeshes.map(mesh => mesh.name), meshSelector);
    }

    vctrApi = new VctrApi("test", errHandler);
    try {
        await vctrApi.init();
    } catch (e) {
        errHandler(e);
    }

    await vctrApi.enableAnnotations(annotationSwitch);
    addAnotations()
    addListeners();
    onReady();
}

run();


