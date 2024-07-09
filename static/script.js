// list bar
//點擊mrt list→跳搜尋框
	let url_mrt="/api/mrts";
	fetch(url_mrt)
	.then((e)=>{
		return e.json();
	}).then((data)=>{
		let mrtContainer=document.querySelector(".list_container");
		if(! mrtContainer){
			console.error(".list_container not found in DOM");
			return;
		}
		data.data.forEach(mrtName=>{
			let mrtElement=document.createElement("div");
			mrtElement.classList.add("list_items");
			mrtElement.textContent=mrtName;
			mrtContainer.appendChild(mrtElement);
			mrtElement.addEventListener('click',()=>{
				let searchBar=document.querySelector("#search");
				searchBar.value =mrtElement.textContent;
				query(mrtElement.textContent);
			});	
		})
	});

let left_arrow=document.querySelector("#left_arrow");
let right_arrow=document.querySelector("#right_arrow");
let itemWidth=150;
let scrollPosition=0;
let mrtContainer=document.querySelector(".list_container");
left_arrow.addEventListener("click",()=>{
	scrollPosition=Math.min(scrollPosition+itemWidth,0);
	mrtContainer.style.transform=`translateX(${scrollPosition}px)`;
});
right_arrow.addEventListener("click",()=>{
	let maxScroll=-mrtContainer.scrollWidth+mrtContainer.clientWidth;
	scrollPosition=Math.max(scrollPosition-itemWidth,maxScroll);
	mrtContainer.style.transform=`translateX(${scrollPosition}px)`;
});
//attractions沒有關鍵詞的時候
	let page=0;
	let url_="/api/attractions?page="+page;
	fetch(url_,{"page":page}).then(e=>{return e.json();}).then((data)=>{
		page=data.nextPage;
		let attractions=data.data;
		load_attractions(attractions);
		load_attractions_more(page);
	});

//搜尋框
document.addEventListener("DOMContentLoaded",(event)=>{
	let searchBtn=document.querySelector("#searchBtn");
	let search=document.querySelector("#search");
	search.addEventListener('keydown',(event)=>{ //按鍵盤Enter=click
		if(event.key==='Enter'){
			event.preventDefault();
			searchBtn.click();
		}
	});
	searchBtn.addEventListener('click',()=>{
		let searchBar=document.querySelector("#search");
		let keyword=searchBar.value;
		query(keyword);
	});
});

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
let url="/";
let user=await CheckAuth_WithToken();
console.log("current user=",user);
ShowDialog();
Signup();
Signin(url);
if(token){ Signout(url); }
checkBooking(user);



// 函式區
function load_attractions(data){
	let attractions_frame=document.querySelector("#attractions_frame");
	for(let i=0; i<data.length;i++){
		let attBox=document.createElement("div");
		attBox.classList.add("att");
		let image=document.createElement("img");
		image.classList.add("img");
		let attName=document.createElement("div");
		attName.classList.add("attName");
		let attMrtCategory=document.createElement("div");
		attMrtCategory.classList.add("attMrtCategory");
		let attMrt=document.createElement("div");
		let attCategory=document.createElement("div");
		attMrt.classList.add("attInfo");
		attCategory.classList.add("attInfo");
		attCategory.classList.add("category");
		attMrtCategory.appendChild(attMrt);
		attMrtCategory.appendChild(attCategory);
		attBox.appendChild(image);
		attBox.appendChild(attName);
		attBox.appendChild(attMrtCategory);
		image.src=data[i]["images"][0];
		attName.textContent=data[i]["name"];
		attMrt.textContent=data[i]["mrt"];
		attCategory.textContent=data[i]["category"]
		attractions_frame.appendChild(attBox);
		//同步設定點擊事件取得attractionId
		attBox.addEventListener('click',()=>{
			let attractionId=data[i]["id"]
			location.href="/attraction/"+attractionId;
		});

	}
}

function load_attractions_more(page,keyword=''){
	const option = {threshold: 1.0};
	let isloading =false; //flag
	let callback=(entries,observer)=>{	
		if(entries[0].isIntersecting && ! isloading){
			isloading=true;
			let url=`api/attractions?page=${page}${keyword ? `&keyword=${keyword}` : ''}`;
			fetch(url,{"page":page,"keyword":keyword}).then(e=>{return e.json();}).then((data)=>{
				page=data.nextPage;
				let attractions=data.data;
				load_attractions(attractions);
				observer.unobserve(entries[0].target);
				let newTarget=document.querySelector("div.att:nth-last-child(1)");
				if(newTarget && page !=null){
					observer.observe(newTarget);
				}else{ observer.disconnect();}	
			}).finally(()=>{
				isloading=false;//flag
				});	
		}	
	}
	let observer=new IntersectionObserver(callback,option);
	let attbox=document.querySelector("div.att:nth-last-child(1)");
	if(attbox){ observer.observe(attbox);}	
}

function query(keyword){
	let page=0;
	let url=`api/attractions?page=${page}${keyword ? `&keyword=${keyword}` : ''}`;
	fetch(url,{"page":page,"keyword":keyword})
	.then(e=>{return e.json()}).then((data)=>{
		let attbox=document.querySelectorAll(".att");
		attbox.forEach(box=>{
			box.remove();
		});
		let query=data.data;
		load_attractions(query);
		let nextPage=data.nextPage;
		if(nextPage !=null){
			load_attractions_more(nextPage,keyword);
		}
	});
	
}
