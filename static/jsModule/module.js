export function ShowDialog() {
  //signup&signin dialog點擊事件
  let signinBigBtn = document.querySelector("#userBtn");
  let dialog_signin = document.querySelector("#dialog_signin");
  let dialog_signup = document.querySelector("#dialog_signup");
  let signupBtn = document.querySelector("#wantSignup");
  let signinBtn = document.querySelector("#wantSignin");
  let closeSignin = document.querySelector("#closeSignin");
  let closeSignup = document.querySelector("#closeSignup");
  let mask = document.querySelector(".dialog_mask");
  let name = document.querySelector("#signupName");
  let email = document.querySelector("#signupEmail");
  let password = document.querySelector("#signupPassword");
  let emailSI = document.querySelector("#signinEmail");
  let passowrdSI = document.querySelector("#signinPassword");
  let resultSI = document.querySelector("#signinResult");
  let result = document.querySelector("#signupResult");

  signinBigBtn.addEventListener("click", () => popup(mask, dialog_signin));
  signupBtn.addEventListener("click", () => {
    dialog_signin.style.display = "none";
    dialog_signup.style.display = "block";
  });
  signinBtn.addEventListener("click", () => {
    dialog_signin.style.display = "block";
    dialog_signup.style.display = "none";
  });
  closeSignin.addEventListener("click", () => {
    emailSI.value = "";
    passowrdSI.value = "";
    resultSI.textContent = "";
    dialog_signin.style.display = "none";
    mask.style.display = "none";
  });
  closeSignup.addEventListener("click", () => {
    name.value = "";
    email.value = "";
    password.value = "";
    result.textContent = "";
    dialog_signup.style.display = "none";
    mask.style.display = "none";
  });
}
export function Signup() {
  //signup註冊
  let re = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$%])[a-zA-Z\d@#$%]{4,8}$/;
  document.querySelector("#signupBtn").addEventListener("click", (e) => {
    let name = document.querySelector("#signupName");
    let email = document.querySelector("#signupEmail");
    let password = document.querySelector("#signupPassword");
    if (!name.value) {
      e.preventDefault();
      alert("請輸入會員名稱");
    } else if (!email.value) {
      e.preventDefault();
      alert("請輸入電子信箱");
    } else if (checkEamilValidity(email.value) == false) {
      e.preventDefault();
      alert("請輸入正確的電子信箱格式");
    } else if (!password.value) {
      e.preventDefault();
      alert("請輸入密碼");
    } else if (password.value.match(re) == null) {
      e.preventDefault();
      alert("請設定長度4~8碼含英文及數字及@#$%的密碼");
    } else {
      const signupForm = document.querySelector("#signupForm");
      const formData = new FormData(signupForm);
      const form = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      };
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("response=", data);
          let result = document.querySelector("#signupResult");
          let dialogLayout = document.querySelector(".frame_signup");
          if (data.ok == true) {
            result.textContent = "註冊成功";
            result.style.color = "green";
          } else {
            result.textContent = data.message;
            result.style.color = "red";
          }
          dialogLayout.style.height = "352px";
          result.style.display = "block";
        })
        .catch((error) => {
          console.log("error:", error);
        });
    }
  });
}
//signin登入
export function Signin(url) {
  document.querySelector("#signinBtn").addEventListener("click", (e) => {
    let email = document.querySelector("#signinEmail");
    let passowrd = document.querySelector("#signinPassword");
    if (!email.value) {
      e.preventDefault();
      alert("請輸入電子信箱");
    } else if (!passowrd.value) {
      e.preventDefault();
      alert("請輸入密碼");
    } else {
      const signinForm = document.querySelector("#signinForm");
      const formData = new FormData(signinForm);
      const form = {
        email: formData.get("email"),
        password: formData.get("password"),
      };
      fetch("/api/user/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          let result = document.querySelector("#signinResult");
          let dialogLayout = document.querySelector(".frame_signin");
          if (data.error == true) {
            result.textContent = data.message;
            result.style.color = "red";
          }
          if (data.Token != null) {
            localStorage.setItem("Token", data.Token);
            fetch(url)
              .then((response) => response)
              .then((data) => {
                location.href = url;
              })
              .catch((error) => console.error("Error:", error));
          }
          dialogLayout.style.height = "295px";
          result.style.display = "block";
        })
        .catch((error) => {
          console.log("error:", error);
        });
    }
  });
}

//登出&remove Token
export function Signout(url) {
  let signinBigBtn = document.querySelector("#userBtn");
  signinBigBtn.addEventListener("click", () => {
    localStorage.removeItem("Token");
    console.log("狀態:已登出");
    signinBigBtn.textContent = "登入/註冊";
    fetch(url)
      .then((response) => response)
      .then((data) => {
        location.href = url;
      })
      .catch((error) => console.error("Error:", error));
  });
}

//驗證
export async function CheckAuth_WithToken() {
  let token = localStorage.getItem("Token");
  if (!token) {
    let signinBigBtn = document.querySelector("#userBtn");
    signinBigBtn.textContent = "登入/註冊";
    return { error: true };
  } else {
    let url = "/api/user/auth";
    let options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    let user = await fetch(url, options)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // console.log("user=",data.data);
        if (data.data) {
          let signinBigBtn = document.querySelector("#userBtn");
          signinBigBtn.textContent = "登出系統";
          return data.data;
        }
      })
      .catch((error) => {
        console.log("error=", error);
      });
    return user;
  }
}

export function checkBooking_checkMemberPage(user) {
  let bookingBtn = document.querySelector("#bookingBtn");
  let memberBtn = document.querySelector("#memberPage");
  bookingBtn.addEventListener("click", () => {
    if (user.error) {
      let dialog_signin = document.querySelector("#dialog_signin");
      let mask = document.querySelector(".dialog_mask");
      popup(mask, dialog_signin);
    } else {
      location.href = "/booking";
    }
  });
  memberBtn.addEventListener("click", () => {
    if (user.error) {
      let dialog_signin = document.querySelector("#dialog_signin");
      let mask = document.querySelector(".dialog_mask");
      popup(mask, dialog_signin);
    } else {
      location.href = "/member";
    }
  });
}

// 沒有import的函式
//登入/註冊事件名稱
function popup(mask, dialog_signin) {
  mask.style.display = "block";
  dialog_signin.style.display = "block";
}
//Email的regex
function checkEamilValidity(emailValue) {
  let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (emailPattern.test(emailValue)) {
    return true;
  } else {
    return false;
  }
}
