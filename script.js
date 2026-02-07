console.log("hi")
const video=document.getElementById("preview")
const uploadInp=document.getElementById("uploadInput")
const capturedImg=document.getElementById("capturedImg")
const uploadBtn=document.getElementById("uploadBtn")
const captureBtn=document.getElementById("captureBtn")
canvas = document.getElementById("canvas")
let stream=null
async function captureImg(){
    console.log("Image Selection")
    if(stream){
        captureFrame()
        return
    }
    try{
        stream = await navigator.mediaDevices.getUserMedia({
            video:{facingMode:"user"},
            audio:false
        })
        video.srcObject=stream
        console.log(video)
        video.onloadedmetadata=()=>{
                video.play()
            }

        }
    catch(error){
        console.log(error)
        
    }
}
    function captureFrame(){
        // uploadBtn.disabled=false
        
            const w = video.videoWidth;
            const h = video.videoHeight;
            canvas.width = w
            canvas.height = h
            ctx=canvas.getContext("2d")
            ctx.drawImage(video,0,0,w,h)
            // console.log(video,ctx)
            const dataURL = canvas.toDataURL("image/png")
            // console.log(dataURL)
            capturedImg.src=dataURL
            console.log(capturedImg.src)
            capturedImg.classList.remove("d-none")
        
    }

captureBtn.addEventListener("click", captureImg)