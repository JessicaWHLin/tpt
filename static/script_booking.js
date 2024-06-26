
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
console.log("user in script_att=",user);
ShowDialog();
Signup();
Signin(url_);
if(token){ Signout(url_); }
checkBooking(user);

//show user name
if(user.name){
	let userName=document.querySelector("#user");
	userName.textContent=user.name;
	let wrapper=document.querySelector(".wrapper");
	wrapper.style.minHeight="auto";
}
else{
	location.href="/";
}

//防呆input空白

//click btn: 檢查booking table拿到未預定行程

