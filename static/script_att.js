//選時間跳價錢
let changeObsever=document.querySelector(".field_time");
let morning=document.querySelector("#morning");
let evening=document.querySelector("#evening");
let price=document.querySelector(".price");
let time="上午9點到下午2點";
let amount=2000;

changeObsever.addEventListener("change",(event)=>{
	if(event.target.type==="radio"){
		if(evening.checked){
			price.textContent="新台幣2500元";
			time="下午4點到晚上9點";
			amount=2500;
		}
		else{
			price.textContent="新台幣2000元";;
		}
	}
});

//load attraction to sectionInfo
let path=window.location.pathname;
let pathSegments=path.split('/');
let attractionId=pathSegments[pathSegments.length-1];
let url="/api/attraction/"+attractionId;
fetch(url).then(e=>{
	return e.json();
}).then((data)=>{
	//如果id>58,防呆未設XXX
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
	//slideshows-拿圖片
	let picture_container=document.querySelector(".picture_current");
	let circle_wrapper=document.querySelector(".circle_wrapper");
	for(let i=0;i<data.data.images.length;i++){
		let mySlide=document.createElement("div");
		let img=document.createElement("img");
		let circle=document.createElement("div");
		circle.classList.add("circle");
		mySlide.classList.add("mySlides");
		mySlide.classList.add("fade");
		img.src=data.data.images[i];
		img.classList.add("slideshow");
		mySlide.appendChild(img);
		picture_container.appendChild(mySlide);
		circle_wrapper.appendChild(circle);
	}
	//slideshow-動畫
	let slidepage=1;
	let current_slidepage=showSlides(slidepage);
	let leftArrow=document.querySelector(".arrow_container_img.left");
	let rightArrow=document.querySelector(".arrow_container_img.right");
	let circles=document.querySelectorAll(".circle");
	leftArrow.addEventListener("click",()=>{
		current_slidepage=plusSlides(-1,current_slidepage);
	});
	rightArrow.addEventListener("click",()=>{
		current_slidepage=plusSlides(1,current_slidepage);
	});
	document.addEventListener('keydown', (event)=>{
		if (event.key === "ArrowLeft") {
			current_slidepage=plusSlides(-1,current_slidepage);
		} else if (event.key === "ArrowRight") {
			current_slidepage=plusSlides(1,current_slidepage);
			}
	});
	circles.forEach((circle,index) => {
		let whichPage=index+1;
		circle.addEventListener("click",()=>{
			current_slidepage=showSlides(whichPage);
		});
	});
	

}).catch(error=>console.error("Error:", error));

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
let url_="/attraction/"+attractionId;
let user=await CheckAuth_WithToken();
console.log("current user=",user);
ShowDialog();
Signup();
Signin(url_);
if(token){ Signout(url_); }
checkBooking_checkMemberPage(user);

//送出newbooking
let newBookingBtn=document.querySelector("#newBookingBtn");
newBookingBtn.addEventListener("click",(e)=>{
	let date=document.querySelector("#date");
	if(!date.value){
		e.preventDefault();
		alert("請選擇預定日期");
	}
	else{
		const currentDate=new Date();
		let daysToAdd=3;
		currentDate.setDate(currentDate.getDate()+daysToAdd);
		let inputDate=new Date(date.value);
		if(inputDate<currentDate){
			e.preventDefault();
			alert("請輸入正確日期\n請預約三日後日期");
		}
		else{
			const booking={
				attractionId:attractionId,
				date:date.value,
				time:time,
				price:amount
			}
			let urlNewBooking="/api/booking";
			let options={
			method:"POST",
			headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
			body: JSON.stringify(booking)
			};
			fetch(urlNewBooking,options)
			.then(response=>{
				return response.json();
			})
			.then(data=>{
				if(data.error ){
					if( data.message=="Un-signin"){
						alert("請先登入");
					}
					else{
						alert("預定行程失敗");
					}
				}
				else{
					alert("預定行程成功");
					location.href="/booking";
				}
			}).catch(error=>{
				console.log("error:",error);
			});
		}
	}
});


//函式區
function showSlides(page){
	let slides=document.querySelectorAll(".mySlides");
	let circles=document.querySelectorAll(".circle");
	let newPage=null;
	// console.log("slides.length="+slides.length);
	if(page>slides.length){
		newPage=1;
	}
	else if(page<1){
		newPage=slides.length;
	}
	else{
		newPage=page;
	}
	for(let i=0;i<slides.length;i++){
		slides[i].style.display="none";
	}
	for(let i=0;i<circles.length;i++){
		circles[i].className=circles[i].className.replace("active","");
	}
	slides[newPage-1].style.display="block";
	circles[newPage-1].classList.add("active");
	// console.log("newPage="+newPage);
	return newPage;
}

function plusSlides(parameter,current_slidepage){
	return showSlides(current_slidepage+=parameter);
}
