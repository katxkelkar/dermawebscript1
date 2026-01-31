console.log("hi")
const preview=document.getElementById("preview")
const uploadInp=document.getElementById("uploadInput")
const captureInp=document.getElementById("captureInput")
const uploadBtn=document.getElementById("uploadBtn")
const captureBtn=document.getElementById("captureBtn")

function selectImg(){
    console.log("Image Selection")

}

uploadBtn.addEventListener("click", selectImg)