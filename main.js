import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs';
console.log(pdfjsLib);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs';
let capturedText='';
let askButton=null;
let inputBox= null;
let submitButton= null;
let answerDiv=null;

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

    askButton= document.getElementById('askButton');
    if (!askButton){
        askButton= document.createElement('button');
        askButton.id='askButton';
        askButton.textContent='Ask';
        document.body.appendChild(askButton);

        askButton.addEventListener('click',()=>{
            console.log('Captured Text: ', capturedText);
            askButton.style.display='none';
            if (!inputBox){
                inputBox=document.createElement("input");
                inputBox.type='text';
                inputBox.placeholder='Enter your question';
                inputBox.style.position='fixed';
                inputBox.style.top=askButton.style.top;
                inputBox.style.left=parseInt(askButton.style.left)+'px';
                document.body.appendChild(inputBox);

                submitButton=document.createElement("button");
                submitButton.textContent='Submit';
                submitButton.style.position='fixed';
                submitButton.style.top=askButton.style.top;
                submitButton.style.left=(parseInt(askButton.style.left)+150)+'px';
                document.body.appendChild(submitButton);

                submitButton.addEventListener('click', async()=>{
                    const question=inputBox.value;
                    console.log('Question is: ', question);
                    console.log('Captured Text is: ', capturedText);
                    const response=await fetch("http://localhost:8001/ask",{
                        'method':'POST',
                        'headers': {
                        'Content-Type':'application/json'
                        },
                        'body': JSON.stringify({
                            "question": question,
                            "capturedText": capturedText
                        })
                    })
                    const output= await response.json();
                    console.log('Response from backend: ', output);
                    submitButton.style.display='none';
                    inputBox.style.display='none';


                    if (!answerDiv){
                       answerDiv=document.createElement("div");
                       answerDiv.style.position='fixed';
                       answerDiv.style.top=askButton.style.top;
                       answerDiv.style.left=parseInt(askButton.style.left)+300+'px';
                       answerDiv.style.backgroundColor='white';
                       answerDiv.style.border='1px solid black';
                       answerDiv.style.padding='10px';
                       document.body.appendChild(answerDiv);
                    }
                    answerDiv.style.display='block';
                    answerDiv.textContent=output;
                });

            }
            submitButton.style.display='block';
            inputBox.style.display='block';
            inputBox.value='';
            if (answerDiv){
                answerDiv.style.display='none';
            }
            });
    }
    askButton.style.position='fixed';
    askButton.style.top=(rect.top-35)+'px';
    askButton.style.left=(rect.right)+'px';
    askButton.style.display='block';
 
});
