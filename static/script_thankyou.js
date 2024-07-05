//回首頁
let homePage=document.querySelector(".home");
homePage.addEventListener("click",()=>{
	let url="/";
	fetch(url).then(response=>response)	.then(data=>{
	 location.href=url;
    }).catch(error=>console.error("Error:", error));
});

import {ShowDialog,Signup,Signin,Signout,CheckAuth_WithToken, checkBooking} from "./jsModule/module.js";
let token=localStorage.getItem("Token");
let url_="/booking";
let user=await CheckAuth_WithToken();
console.log("current user=",user);
ShowDialog();
Signup();
Signin(url_);
if(token){ Signout(url_); }
checkBooking(user);

let username=document.querySelector("#user");
username.textContent=user.name;

//取得order number
let newUrl=new URL(window.location.href);
let number=newUrl.searchParams.get("number");
let orderNumber=document.querySelector("#order_number");
if(number !=null){
	orderNumber.textContent=number;
	//show成功訂單
	let url_order="api/order/"+number;
	const options={
		method:"GET",
		headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
	}
	let orderInfo=await getData(url_order,options);
	if(orderInfo){
		document.querySelector("#order_attName").textContent=orderInfo.data.name;
		document.querySelector(".booking_image").src=orderInfo.data.image;
		document.querySelector("#order_date").textContent=orderInfo.data.date;
		document.querySelector("#order_time").textContent=orderInfo.data.time;
		document.querySelector("#order_address").textContent=orderInfo.data.address;
	}
}else{
	alert("系統中查無付款成功行程");
	location.href="/booking";
}



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