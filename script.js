console.log("hi")
const video=document.getElementById("videoStream")
const previewImg=document.getElementById("previewImage")
const canvas = document.getElementById("canvas")
const fileInput=document.getElementById("fileInput")

const retakeBtn=document.getElementById("retakeBtn")
const saveBtn=document.getElementById("saveBtn")
const detectBtn=document.getElementById("detectBtn")
const uploadBtn=document.getElementById("uploadBtn")
const captureBtn=document.getElementById("captureBtn")

const initialControls=document.getElementById("initialControls")
const afterCaptureControls=document.getElementById("afterCaptureControls")
const loadingOverlay=document.getElementById("loadingOverlay")
const resultsSection=document.getElementById("resultsSection")
const resultContent=document.getElementById("resultContent")
const capturedImg=document.getElementById("capturedImg")
let dataURL=""
let uploadedFile=null

let stream=null
let currentImgblob=null
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
            showVideoMode()
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
            dataURL = canvas.toDataURL("image/png")
            // console.log(dataURL)
            previewImg.src=dataURL
            showImageMode()
            stopCamera()
            // capturedImg.classList.remove("d-none")
            previewImg.style.display="block"
        
    }

    function stopCamera(){
        stream.getTracks().forEach(t=>t.stop())
        stream=null
        video.srcObject=null
    }

    function showImageMode(){
        video.style.display="none"
        previewImg.style.display="block"
        initialControls.classList.add("hidden")
        afterCaptureControls.classList.remove("hidden")
    }
    function showVideoMode(){
        video.style.display="block"
        previewImg.style.display="none"
        initialControls.classList.remove("hidden")
        afterCaptureControls.classList.add("hidden")
    }



captureBtn.addEventListener("click", captureImg)

retakeBtn.addEventListener("click", async()=> {
    await captureImg()
    video.style.display="block"
    previewImg.style.display="none"
    captureBtn.style.display="block"
    afterCaptureControls.style.display="none"
})

saveBtn.addEventListener("click", async()=>{
    const src=previewImg.getAttribute("src")
    if (!src) return
    try {
        let blob
        if (src.startsWith("data:image/")){
            const response = await fetch (src)
            blob = await response.blob()
                }
        else{
            const response = await fetch (src)
            blob = await response.blob()
        }
        const downloadURL= URL.createObjectURL(blob); 

    
    const link=document.createElement("a")
    link.href=downloadURL
    link.download="capture-"+Date.now()+".png"
    document.body.appendChild(link)
    link.click()
    // const blob = dataURLtoBlob(capturedData); 
    // const formData = new FormData(); 
    // formData.append("image", blob, filename); 
    // await fetch(`${SERVER}/upload`, { method: "POST", body: formData });
    link.remove()
    URL.revokeObjectURL(downloadURL)
    }
    catch(err){
        alert("failed to save image")
        console.error(err)
    }
})

fileInput.addEventListener("change", ()=>{
    const file=fileInput.files && fileInput.files[0]
    if(!file) return
    if (!file.type.startsWith("image/")){
        alert("Please Upload a Valid Image")
        return //technically the "break"
    }

uploadedFile=file
dataURL=""
const reader=new FileReader()
    reader.onload=(e)=>{previewImg.src=e.target.result;
        showImageMode()
        stopCamera()
    }
    reader.readAsDataURL(file)

})

uploadBtn.addEventListener("click", ()=>{
    //console.log(this.files[0])
    fileInput.value="" //resetting the same file so it can be picked again
    fileInput.click() //opening file dialogue
})