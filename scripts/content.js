
let key="";
let secret="";
const contestId=parseInt(location.href.split("/")[5])
const index=location.href.split("/")[6]
friends_submission=[];
storagekey=`${contestId}[${index}]`;
// Get key and secret 
function main(){
if (chrome.storage.local.get(['apiKey','apiSecret',`${storagekey}`],(result)=>{
        if(result.apiKey && result.apiSecret && !result[storagekey]){
            key=result.apiKey;
            secret=result.apiSecret;
            getFriends();
            }
            else if (!result.apiKey || !result.apiSecret){
              console.log("Key and Secret has not been set");
            }
            else if (result[storagekey]){
              friends_submission=result[storagekey];
              changeHtml(cache=true);
            }
    }));
  }


async function getFriends(){
  
  const time=getCurrentTimestamp();
  const random=getRandom();
  const hash= await getHash(random,time);
  try{
  let response=await fetch (`https://codeforces.com/api/user.friends?apiKey=${key}&time=${time}&apiSig=${random}${hash}`);
  response=await response.json();
  if (response.status!="OK")
  {
    throw new Error(response.comment)
  }
  const friends=response.result;
  // 
  createTable();
  getSubmission(friends);
  }
  catch(error)
  {
    const gpnode=document.createElement("div");
    gpnode.innerHTML=`
        <div class="roundbox sidebox borderTopRound" id="extensionDiv"style="">
            <div class="caption titled">→ Friends' Correct Submission <br>(From Extension)
            </div>
             <table class="rtable smaller">
              <tbody id="tbodyExtension>
                <tr id="messageExtension"><td>Error Occured (see console log for details) !!</td></tr>
              </tbody>
            </table
        </div>`
        document.querySelectorAll("div.roundbox.sidebox.borderTopRound")[document.querySelectorAll("div.roundbox.sidebox.borderTopRound").length-2].insertAdjacentElement("beforebegin",gpnode);
        console.log(error.message)
        return null;

  }
}
async function getSubmission(friends){
    for (element of friends){
      // finding data
      try{
        let res=await fetch(`https://codeforces.com/api/user.status?handle=${element}`);
        let resjson= await res.json();
        if (resjson.status!="OK"){
          throw new Error (resjson.comment)
        }
        
        for (let submission of resjson.result)
        {
          if (submission.contestId===contestId){
            if (submission.problem.index===index && submission.verdict==="OK"){
            
              friends_submission.push([element,submission.id,"black"])
              
            }
          }
        }
      }
      catch(error){
        console.log(error.message);
        document.querySelector("#messageExtension").innerHTML="<td>Error Occured (see console log for details) !!</td>";
        return null;
      }
    }
      changeHtml();
};
    

async function changeHtml(cache=false){
  if (friends_submission.length===0){
    document.querySelector("#messageExtension").innerHTML="<strong>Sorry, None of Friends submitted code which was Accepted</strong><br><button id='refresh'>Refresh List</button>";
    
  }
  else{
    if (!cache){
    friends_submission=await getColor(friends_submission);
    }
    else{
      createTable()
    }
    table=document.querySelector("#tbodyExtension");
    table.innerHTML=`
        <tr>
          <th class="left " style="width:6em;">Friend</th>
          <th class=" " style="width:7em;">Submission</th>
        </tr>`
    
    
      for (element of friends_submission){
      node=document.createElement("tr");
      node.innerHTML=`
          <td class="bottom user-${element[2]}" style="border: 1px solid rgb(185, 185, 185); border-left:none;"><strong>${element[0]}</strong></td>
          <td class="left bottom" style="border:1px solid rgb(185, 185, 185);border-right:none;"><a href="/contest/${contestId}/submission/${element[1]}">${element[1]}</a></td>`      
      table.appendChild(node);
      }
      node=document.createElement("tr");
      node.innerHTML=`<td colspan="2"><button id="refresh">Refresh List</button></td>`
      table.appendChild(node);
      


  }
        document.querySelector('#refresh').addEventListener('click',()=>{
        chrome.storage.local.remove([`${storagekey}`]);
            document.querySelector("#extensionDiv").remove()
            friends_submission=[]
            main()

          
      })
  }
  


function getCurrentTimestamp () {
  return parseInt(Date.now()/1000)
}
function getRandom() {
  return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}
async function getHash(random,time){
    string=`${random}/user.friends?apiKey=${key}&time=${time}#${secret}`
    // converting string to utf-8
    const encoder=new TextEncoder();
    const data=encoder.encode(string);
    // applying sha-512
    const hashBuffer=await crypto.subtle.digest('SHA-512',data);
    // converting arraybuffer to hex string
    const hashArray=Array.from(new Uint8Array(hashBuffer));
    const hashHex=hashArray.map(b=>('00'+b.toString(16)).slice(-2)).join("")
    return hashHex;

}

async function getColor(friends_submission){
  for (element of friends_submission){
   try {  
      response =await fetch (`https://codeforces.com/api/user.info?handles=${element[0]}&checkHistoricHandles=false`)
      response = await response.json()
      if (response.status!='OK'){
        throw new Error (response.comment)
      }
      rank=response.result[0].rank;
      rColor='';

      if (rank==='newbie'){
        rColor='gray'
      }
      else if (rank === "pupil"){
        rColor='green'
      }
      else if (rank==="specialist"){
        rColor='cyan'
      }
      else if (rank==="expert"){
        rColor='blue'
      }
      else if (rating ==="candidate master"){
        rColor='violet'
      }
      else if (rating==="master" || rating === "international master"){
        rColor='orange'
      }
      else if (rating === "grandmaster" || rating === "international grandmaster"){
        rColor='red'
      }
      else if (rating === "legendary grandmaster"){
        rColor="legendary"
      }
    element[2]=rColor      

   } 
    catch(error){

        console.log(error);
        
      }   
  }

  chrome.storage.local.set(
                {[storagekey]:friends_submission,
            },()=> {});
  return friends_submission
  
}

function createTable (){
  const gpnode=document.createElement("div");
  gpnode.innerHTML=`
      <div class="roundbox sidebox borderTopRound" id="extensionDiv"style="">
          <div class="caption titled">→ Friends' Correct Submission <br>(From Extension)
          </div>
          <table class="rtable smaller">
              <tbody id="tbodyExtension">
                <tr id="messageExtension">
                  <td>
                    Waiting for Data to be fetched...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>`
  document.querySelectorAll("div.roundbox.sidebox.borderTopRound")[document.querySelectorAll("div.roundbox.sidebox.borderTopRound").length-2].insertAdjacentElement("beforebegin",gpnode);
}

main()