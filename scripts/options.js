document.addEventListener("DOMContentLoaded",()=>{
    // Getting all the elements 
    const Key=document.querySelector("#apiKey");
    const Secret=document.querySelector("#apiSecret");
    const Message=document.querySelector("#message");
    // Load previous valus if stored
    if (chrome.storage.local.get(['apiKey','apiSecret'],(result)=>{
        if(result.apiKey && result.apiSecret){
            Key.value=result.apiKey;
            Secret.value=result.apiSecret;
            Message.innerHTML="Your Api Has Been Set Succesfully";

        }
    }));
    document.querySelector("#set").addEventListener("click",(e)=>{
        e.preventDefault();
        if (Secret.value && Key.value){
            chrome.storage.local.set(
                {"apiKey":Key.value,
                "apiSecret":Secret.value
            },()=>{
                Message.innerHTML="Your Api Has Been Set Succesfully";
            });
        }
        else{
            Message.innerHTML="Please Retry";
        }
    })
    document.querySelector("#delete").addEventListener("click",(e)=>{
        e.preventDefault();
        if (Secret.value && Key.value){
            chrome.storage.local.set(
                {"apiKey":"",
                "apiSecret":""
            },()=>{
                Message.innerHTML="Api has been Deleted from Extension";
                Secret.value="";
                Key.value="";
            });
        }
        else{
            Message.innerHTML="You didn't set Api, which could be deleted";
        }
    })
})