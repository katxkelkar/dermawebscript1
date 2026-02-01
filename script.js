console.log("hi")
const preview=document.getElementById("preview")
const uploadInp=document.getElementById("uploadInput")
const captureInp=document.getElementById("captureInput")
const uploadBtn=document.getElementById("uploadBtn")
const captureBtn=document.getElementById("captureBtn")
canvas = document.getElementById("canvas")
console.log(captureBtn)

async function captureImg(){
    console.log("Image Selection")
    try{
        stream = await navigator.mediaDevices.getUserMedia({
            video:{facingMode:"user"},
            audio:false
        })
        preview.srcObject=stream
        console.log(preview)
        uploadBtn.disabled=false
        if (stream){
            const w = canvas.videoWidth;
            const h = canvas.videoHeight;
            canvas.width = w
            canvas.height = h
            ctx=canvas.getContext("2d")
            ctx.drawImage(canvas,0,0,w,h)
            console.log(canvas,ctx)
        }
    }
    catch(error){
        console.log(error)
        
    }
}

captureBtn.addEventListener("click", captureImg)