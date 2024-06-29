
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


//有登入才能進入booking
if(user.name){
	let userName=document.querySelector("#user");
	let id=user.id;
	userName.textContent=user.name;
	//用user id去找到未預定的行程
	let url_getBooking="/api/booking";
	const options={
		method:"GET",
		headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
	};
	let getBooking=await getData(url_getBooking,options);

	if(getBooking.data==null){
		let wrapper=document.querySelector(".wrapper");
		wrapper.style.minHeight="auto";
	}
	else{
		let footer=document.querySelector(".footer_emptyStatus");
		let emptyStatus=document.querySelector(".booking_emptyStatus");
		let vaildStatus=document.querySelector(".booking_vaildStatus");
		let image=document.querySelector(".booking_image");
		let attName=document.querySelector("#attName");
		let date=document.querySelector("#bookingDate");
		let time=document.querySelector("#bookingTime");
		let price=document.querySelector("#bookingPrice");
		let amount=document.querySelector("#amount");
		let address=document.querySelector("#bookingAddress");
		let username_input=document.querySelector("#username");
		let email_input=document.querySelector("#email");
		footer.style.height="104px";
		emptyStatus.style.display="none";
		vaildStatus.style.display="block"
		image.src=getBooking.data.attraction.image;
		attName.textContent=getBooking.data.attraction.name;
		date.textContent=getBooking.data.date;
		time.textContent=getBooking.data.time;
		price.textContent="新台幣"+getBooking.data.price+"元";
		amount.textContent=getBooking.data.price;
		address.textContent=getBooking.data.attraction.address;
		username_input.value=user.name;
		email_input.value=user.email;
	}
}
else{
	location.href="/";
}

//delete 行程

let deleteBooking=document.querySelector("#deleteIcon");
if(deleteBooking){
	deleteBooking.addEventListener('click',async()=>{
		let url_delete="/api/booking";
		const options={
			method:"DELETE",
			headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
		}
		let deleteResult=await getData(url_delete,options);
		if(deleteResult.ok==true){
			location.href="/booking";
		}
	});
}else{
	console.log("error");
}

async function getData(url,options){
	let data=await fetch(url,options)
	.then(response=>{
		return response.json();
	}).catch(error=>{
		console.log("error:", error);
	});
	return data;
}

