if (chrome.storage.local.get(['apiKey','apiSecret'],(result)=>{
    if(result.apiKey && result.apiSecret){
        document.querySelector(".notSet").style.display="none";    
        document.querySelector(".Set").style.display="block";    
    }
    else{
            document.querySelector(".notSet").style.display="block";    
        document.querySelector(".Set").style.display="none";
    }
}));
