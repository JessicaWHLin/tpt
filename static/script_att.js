//選時間跳價錢
let changeObsever=document.querySelector(".field_time");
let morning=document.querySelector("#morning");
let evening=document.querySelector("#evening");
let price=document.querySelector(".price");

changeObsever.addEventListener("change",(event)=>{
	if(event.target.type==="radio"){
		if(evening.checked){
			price.textContent="新台幣2500元";
		}
		else{
			price.textContent="新台幣2000元";
		}
	}
});

//load attraction to sectionInfo
let attractionId=localStorage.getItem("attractionId");
// console.log("attractionId="+attractionId);
url="/api/attraction/"+attractionId;
fetch(url).then(e=>{
	return e.json();
}).then((data)=>{
	// console.log(data.data);
	// console.log(data.data.name);
	let attName=document.querySelector(".h3_attName");
	let attMrtCategory=document.querySelector(".text_category_mrt");
	let info=document.querySelector(".info .detail");
	let address=document.querySelector(".address .detail");
	let transport=document.querySelector(".transport .detail");
	info.textContent=data.data.description;
	address.textContent=data.data.address;
	transport.textContent=data.data.transport;
	attName.textContent=data.data.name;
	attMrtCategory.textContent=data.data.category+" at "+data.data.mrt;
	
	}).catch(error=>console.error("Error:", error));

//回首頁
let homePage=document.querySelector(".home");
homePage.addEventListener("click",()=>{
	url="/";
	fetch(url).then(response=>response)	.then(data=>{
	 location.href=url;
    }).catch(error=>console.error("Error:", error));
});
