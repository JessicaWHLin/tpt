
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

//用user id去找到未預定的行程
let url_getBooking="/api/booking";
const options={
	method:"GET",
	headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
};
let getBooking=await getData(url_getBooking,options);

//有登入才能進入booking
if(user.name){
	let userName=document.querySelector("#user");
	userName.textContent=user.name;
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
//取得key值
let keys=await getData("/api/keys",{method:"GET",headers:{"Content-Type":"application/json"}});
let VENDER_CODE=keys.VENDER_CODE;
let API_KEY=keys.API_KEY;
console.log("vender code=",VENDER_CODE,"\n","api_key=",API_KEY);


//tappay
TPDirect.setupSDK(VENDER_CODE, API_KEY, 'sandbox');
TPDirect.card.setup({
	fields : {
		number: {
			element: '#card-number',
			placeholder: '**** **** **** ****'
		},
		expirationDate: {
			element: document.getElementById('card-expiration-date'),
			placeholder: 'MM / YY'
		},
		ccv: {
			element: '#card-ccv',
			placeholder: 'ccv'
		}
	},
    styles: {
        'input': {
            'color': 'gray'
        },
        'input.ccv': {
            'font-size': '16px'
        },
        'input.expiration-date': {
            'font-size': '16px'
        },
        'input.card-number': {
            'font-size': '16px'
        },
        ':focus': {
            'color': 'black'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
});
let submitButton=document.querySelector(".booking_cfmBtn");
TPDirect.card.onUpdate(function (update) {
    if (update.canGetPrime) {
        submitButton.removeAttribute('disabled');
    } else {
        submitButton.setAttribute('disabled', true);
    }
	TPDirect.CardType.VISA;
	TPDirect.CardType.JCB;
	TPDirect.CardType.AMEX;
	TPDirect.CardType.MASTERCARD;
	TPDirect.CardType.UNIONPAY;
	TPDirect.CardType.UNKNOWN;
	let newType = update.cardType === 'unknown' ? '' : update.cardType;
	let cardtype=document.querySelector("#cardtype");
	cardtype.textContent=newType;

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        setNumberFormGroupToError("#card-number-group");
    } else if (update.status.number === 0) {
        setNumberFormGroupToSuccess("#card-number-group");
    } else {
        setNumberFormGroupToNormal("#card-number-group")
    }
    if (update.status.expiry === 2) {
        setNumberFormGroupToError("#expiration-date-group");
    } else if (update.status.expiry === 0) {
        setNumberFormGroupToSuccess("#expiration-date-group");
    } else {
        setNumberFormGroupToNormal("#expiration-date-group");
    }

    if (update.status.ccv === 2) {
        setNumberFormGroupToError("#card-ccv-group");
    } else if (update.status.ccv === 0) {
        setNumberFormGroupToSuccess("#card-ccv-group");
    } else {
        setNumberFormGroupToNormal("#card-ccv-group");
    }
});
// call TPDirect.card.getPrime when user submit form to get tappay prime
submitButton.addEventListener("click",async(e)=>{
	let phone_input=document.querySelector("#phone").value;
	if(phone_input==""){
		e.preventDefault();
		alert("請輸入手機號碼");
	}else{
		let prime=await getPrime(e);
		let ordersInfo={
			"prime":prime,
			"order":{
				"price":getBooking.data.price,
				"trip":{
					"attraction":{
						"id":getBooking.data.attraction.id,
						"name":getBooking.data.attraction.name,
						"address":getBooking.data.attraction.address,
						"image":getBooking.data.attraction.image
					},				
					"date":getBooking.data.date,
					"time":getBooking.data.time,
				},
				"contact":{
					"name":user.name,
					"email":user.email,
					"phone_number":phone_input,
				}
			}
		};
		let url="/api/orders";
		const options={
			method:"POST",
			headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
			body:JSON.stringify(ordersInfo)
		}
		let transactionResult=await getData(url,options);

		if(transactionResult.data.payment.status == 0){
			let order_number=transactionResult.data.number;
			location.href=`/thankyou?number=${order_number}`;
		}
		else{
			alert("Oops... \n訂單號碼:["+transactionResult.data.number+"]\n訂單付款未成功\n"+"失敗原因："+transactionResult.data.payment.message+"\n請重新預定付款或聯絡系統人員");
			location.href="/booking";
		}
		
	}


});


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

async function getPrime(event) {
    event.preventDefault();
    forceBlurIos(); // fix keyboard issue in iOS device
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('can not get prime');
        return;
    }

    // Get prime
    let prime = await new Promise((resolve, reject) => {
        TPDirect.card.getPrime((result) => {
            if (result.status !== 0) {
                alert('get prime error ' + result.msg);
                reject(result.msg);
                return;
            }
            resolve(result.card.prime);
        });
    });
    return prime;
}


function setNumberFormGroupToError(selector) {
	let element=document.querySelector(selector);
	element.classList.add('has-error');
	element.classList.remove('has-success');
}

function setNumberFormGroupToSuccess(selector) {
	let element=document.querySelector(selector);
	element.classList.remove('has-error');
	element.classList.add('has-success');
}

function setNumberFormGroupToNormal(selector) {
	let element=document.querySelector(selector);
	element.classList.remove('has-error');
	element.classList.remove('has-success');
}

function forceBlurIos() {
	if (!isIos()) {
		return;
	}
	let input = document.createElement('input');
	input.setAttribute('type', 'text');
	// Insert to active element to ensure scroll lands somewhere relevant
	document.activeElement.prepend(input);
	input.focus();
	input.parentNode.removeChild(input);
}

function isIos() {
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}