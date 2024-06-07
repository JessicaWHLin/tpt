
// list bar
//點擊mrt list→跳搜尋框
document.addEventListener("DOMContentLoaded",()=>{
	url="/api/mrts";
	fetch(url).then((e)=>{
		return e.json();
	}).then((data)=>{
		let mrtContainer=document.querySelector(".list_container");
		for(let i =0;i<data.data.length;i++){
			let mrtName=document.createElement("div");
			mrtName.classList.add("list_items");
			mrtName.textContent=data.data[i];
			mrtContainer.appendChild(mrtName);
			mrtName.addEventListener('click',()=>{
				let searchBar=document.querySelector("#search");
				console.log("mrtName.textContent="+mrtName.textContent);
				searchBar.value=mrtName.textContent;
				query(mrtName.textContent);
			});	
		}
	});

});

let left_arrow=document.querySelector("#left_arrow");
let right_arrow=document.querySelector("#right_arrow");
let itemWidth=50;
let scrollPosition=0;
let mrtContainer=document.querySelector(".list_container");
left_arrow.addEventListener("click",()=>{
	scrollPosition=Math.min(scrollPosition+itemWidth,0);
	mrtContainer.style.transform=`translateX(${scrollPosition}px)`;
});
right_arrow.addEventListener("click",()=>{
	let maxScroll=-mrtContainer.scrollWidth+mrtContainer.clientWidth;
	scrollPosition=Math.max(scrollPosition-itemWidth,maxScroll);
	// console.log("scrollPosition="+scrollPosition);
	mrtContainer.style.transform=`translateX(${scrollPosition}px)`;
});

//attractions沒有關鍵詞的時候
document.addEventListener("DOMContentLoaded",()=>{
	let page=0;
	url="/api/attractions?page="+page;
	fetch(url,request={"page":page}).then(e=>{return e.json();}).then((data)=>{
		page=data.nextPage;
		let attractions=data.data;
		load_attractions(attractions);
		load_attractions_more(page);
	});
});

//搜尋框
document.addEventListener("DOMContentLoaded",()=>{
	let searchBtn=document.querySelector("#searchBtn");
	searchBtn.addEventListener('click',()=>{
		let searchBar=document.querySelector("#search");
		let keyword=searchBar.value;
		query(keyword);
	});
});


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
	}
}

function load_attractions_more(page,keyword=''){
	const option = {threshold: 1.0};
	let callback=(entries,observer)=>{	
		if(entries[0].isIntersecting){
			url=`api/attractions?page=${page}${keyword ? `&keyword=${keyword}` : ''}`;
			fetch(url,request={"page":page,"keyword":keyword}).then(e=>{return e.json();}).then((data)=>{
				page=data.nextPage;
				let attractions=data.data;
				load_attractions(attractions);
				observer.unobserve(entries[0].target);
				let newTarget=document.querySelector("div.att:nth-last-child(1)");
				if(newTarget && page !=null){
					observer.observe(newTarget);
				}
			});	
		}else{ observer.disconnect();}		
	}
	let observer=new IntersectionObserver(callback,option);
	let attbox=document.querySelector("div.att:nth-last-child(1)");
	if(attbox){
		observer.observe(attbox);
	}
	
}

function query(keyword){
	let page=0;
	url=`api/attractions?page=${page}${keyword ? `&keyword=${keyword}` : ''}`;
	fetch(url,request={"page":page,"keyword":keyword})
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