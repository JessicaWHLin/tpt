//回首頁
let homePage=document.querySelector(".home");
homePage.addEventListener("click",()=>{
	let url="/";
	fetch(url).then(response=>response)	.then(data=>{
	 location.href=url;
    }).catch(error=>console.error("Error:", error));
});

import {ShowDialog,Signup,Signin,Signout,CheckAuth_WithToken, checkBooking_checkMemberPage} from "./jsModule/module.js";
let token=localStorage.getItem("Token");
let url_="/booking";
let user=await CheckAuth_WithToken();
console.log("current user=",user);
ShowDialog();
Signup();
Signin(url_);
if(token){ Signout(url_); }
checkBooking_checkMemberPage(user);
//顯示現有user訊息
let username=document.querySelector("#name");
let email=document.querySelector("#email");
let updateBtn=document.querySelector("#updateBtn");
let photo=document.querySelector("#photo");
let url_profile="/api/profile";
const options={
	method:"GET",
		headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
}
let profile=await getData(url_profile,options);
if(profile.data[0] !=null){
	photo.src=profile.data[0];
	photo.style.display="block";
}
else{
	photo.style.display="none";
}
username.value=user.name;
email.value=user.email;

updateBtn.addEventListener("click",async()=>{
	alert("更新會員資料")
	let updateInfo;
	let url_update="/api/update"
	let options_noPassword={
		method:"POST",
		headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
		body:JSON.stringify({
			"name":username.value,
			"email":email.value,
		})
	}
	updateInfo=await getData(url_update,options_noPassword);
	localStorage.setItem("Token",updateInfo.Token);
	location.href="/member";
});

//大頭照上傳
let inputBtn=document.querySelector("#profilePhoto");
let upload=document.querySelector("#upload");
upload.addEventListener("click",()=>{
	inputBtn.click();
});
inputBtn.addEventListener("change",async (event)=>{
	const file=event.target.files[0];
	if (file){
		const formdata=new FormData();
		formdata.append("file",file);
	
		let url="/api/upload";
		let options={
			method:"POST",
			headers:{'Authorization':`Bearer ${token}`},
			body:formdata
		}
		let uploadPhoto=await getData(url,options);
		console.log("uploadPhoto= ",uploadPhoto);
		photo.src=`${uploadPhoto.url}`;
		photo.style.display="block";
	}
});
const titles=["訂單編號","景點名稱","預定日期","預定時間","行程費用","付款狀態"];
class Order{
	constructor(containerclass){
		this.container=document.querySelector(containerclass);
	}
	
	add_History_Order(data){
		let orderContainer=document.createElement("div");
		orderContainer.classList.add("orderHistoryContainer");
		let separator=document.createElement("div");
		separator.classList.add("separator");
		for(let i=0;i<6;i++){
			let subcontainer=document.createElement("div");
			subcontainer.classList.add("orderHistorytitle");
			let title=document.createElement("span");
			title.textContent=titles[i]+":";
			let content=document.createElement("span");
			content.classList.add("booking_info_detail");
			content.textContent=data[i];
			subcontainer.appendChild(title);
			subcontainer.appendChild(content);
			orderContainer.appendChild(subcontainer);
		}
		this.container.appendChild(orderContainer);
		this.container.appendChild(separator);
	}
}
let orderelement=new Order("#historyOrder");
let historyOrder=profile.orders;
historyOrder.forEach(order=>{
		orderelement.add_History_Order(order);
})



// 函式區
async function getData(url,options){
	let data=await fetch(url,options)
	.then(response=>{
		return response.json();
	}).catch(error=>{
		console.log("error:", error);
	});
	return data;
}
