import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs';
console.log(pdfjsLib);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs';
let capturedText='';
document.getElementById('pdfInput').addEventListener('change',async (event)=>{
    let file=event.target.files[0];
    let output=await file.arrayBuffer();
    let file_output=pdfjsLib.getDocument({data: output});
    let pdf= await file_output.promise

    let page=await pdf.getPage(100);
    console.log("The page is: ",page)

    /*Building Canvas*/
    const canvas= document.getElementById("pdfCanvas");
    const context= canvas.getContext('2d');
    const viewport= page.getViewport({scale: 1.5});
    canvas.width= viewport.width;
    canvas.height= viewport.height;
    
    await page.render({canvasContext: context, viewport: viewport}).promise;

    /*Building TextLayer*/
    const textDiv= document.getElementById("textLayer");
    console.log("About to create TextLayer, textDiv is:", textDiv);

    const textLayer= new pdfjsLib.TextLayer({
        textContentSource: page.streamTextContent(),
        container: textDiv,
        viewport: viewport
    })
    console.log("TextLayer object created:", textLayer);

    textDiv.style.width = viewport.width + 'px';
    textDiv.style.height = viewport.height + 'px';
    textDiv.style.setProperty('--scale-factor', viewport.scale);
    textDiv.style.setProperty('--total-scale-factor', viewport.scale);
    await textLayer.render()
    console.log("Text layer rendered, children:", textDiv.children.length);

});
document.addEventListener('mouseup', ()=>{
    const selection=window.getSelection();

    if(selection.isCollapsed){
        return;
    }
    const range= selection.getRangeAt(0);
    const rect= range.getBoundingClientRect();
    capturedText=selection.toString();

    let askButton= document.getElementById('askButton');
    if (!askButton){
        askButton= document.createElement('button');
        askButton.id='askButton';
        askButton.textContent='Ask';
        document.body.appendChild(askButton);

        askButton.addEventListener('click',()=>{
            console.log('Captured Text: ', capturedText);
        })
    }
    askButton.style.position='fixed';
    askButton.style.top=(rect.top-35)+'px';
    askButton.style.left=(rect.right)+'px';
    askButton.style.display='block';

})