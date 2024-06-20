export function showDialog(){
	//signup&signin dialog點擊事件
	let signinBigBtn=document.querySelector("#signinBtn");
	let dialog_signin=document.querySelector("#dialog_signin");
	let dialog_signup=document.querySelector("#dialog_signup");
	let signupBtn=document.querySelector("#wantSignup");
	let signinBtn=document.querySelector("#wantSignin");
	let closeSignin=document.querySelector("#closeSignin");
	let closeSignup=document.querySelector("#closeSignup");
	let mask=document.querySelector(".dialog_mask");
	signinBigBtn.addEventListener("click",()=>{
		mask.style.display="block";
		dialog_signin.style.display="block";
	});
	signupBtn.addEventListener("click",()=>{
		dialog_signin.style.display="none";
		dialog_signup.style.display="block";
	});
	signinBtn.addEventListener("click",()=>{
		dialog_signin.style.display="block";
		dialog_signup.style.display="none";
	});
	closeSignin.addEventListener("click",()=>{
		dialog_signin.style.display="none";
		mask.style.display="none";
	});
	closeSignup.addEventListener("click",()=>{
		dialog_signup.style.display="none";
		mask.style.display="none";
	});

	//signup 輸入防呆
	document.addEventListener("DOMContentLoaded",(event)=>{
		let re=/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$%])[a-zA-Z\d@#$%]{4,8}$/;
		document.querySelector("#signupBtn").addEventListener('click',(e)=>{
			let name=document.querySelector("#signupName");
			let email=document.querySelector("#signupEmail");
			let password=document.querySelector("#signupPassword");
			if(! name.value ){
				e.preventDefault();
				alert("請輸入會員名稱");
			}
			else if(! email.value){
				e.preventDefault();
				alert("請輸入會員電子信箱");
			}
			else if(! password.value){
				e.preventDefault();
				alert("請輸入會員密碼");
			}
			else if(password.value.match(re)==null){
				e.preventDefault();
				alert("請設定長度4~8碼含英文及數字及@#$%的密碼");
			}
			else{
				let signupFrom=document.querySelector("#signupForm");
				const formData=new FormData(signupFrom);
				fetch("/api/user",{
					method:"POST",
					body:formData
				}).then(response=>{
					return response.json();
				})
				.then(data=>{
					console.log("response=",data);
					let result=document.querySelector("#signupResult");
					let dialogLayout=document.querySelector(".frame_signup");
					if(data.ok ==true){
						result.textContent="註冊成功";
						result.style.color="green";
					}
					else{
						result.textContent=data.message;
						result.style.color="red";
					}
					dialogLayout.style.height="352px";
					result.style.disconnect="block";
				}).catch(error=>{
					console.log("error:",error);
				});
			}
		});
	});
}