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
let path=window.location.pathname;
let pathSegments=path.split('/');
let attractionId=pathSegments[pathSegments.length-1];
url="/api/attraction/"+attractionId;
fetch(url).then(e=>{
	return e.json();
}).then((data)=>{
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
		//preload test
		preloader(data.data.images[i]);
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
			// console.log("current_slidepage="+current_slidepage);
		});
	});
	

}).catch(error=>console.error("Error:", error));

//回首頁
let homePage=document.querySelector(".home");
homePage.addEventListener("click",()=>{
	url="/";
	fetch(url).then(response=>response)	.then(data=>{
	 location.href=url;
    }).catch(error=>console.error("Error:", error));
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

function preloader(url){
	let img=new Image();
	console.log("img="+img);
	img.onload = function (e) {
		console.log('image preloaded');
	  };
	  img.src=url;
}
