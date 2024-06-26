from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from module.getData import get_data,get_mysql_connection
from module.paging import *
from model.attraction import attractionModel
from view.attraction import attractionView
from model.user import userModel
from view.user import userView
from model.booking import bookingModel
from view.booking import bookingView
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app=FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
get_data()
pool=get_mysql_connection()

SECRET_KEY="c0a1445f1d52c2b5ab8a"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_DAYS=7


# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500,content={"error": True,"message":str(exc)})

@app.get("/api/attractions",response_class=JSONResponse)
async def attractions( page:int=0 , keyword: str |None = None):
	return attractionModel.searchAttraction(page,keyword)

@app.get("/api/attraction/{attractionId}",response_class=JSONResponse)
async def attractionId(response:Response, attractionId:int):
	results_id=attractionModel.get(attractionId)
	return attractionView.render(response,results_id)

@app.get("/api/mrts",response_class=JSONResponse)
async def rankMrts(request:Request):
	return attractionModel.mrts()

class Signup(BaseModel):
	name: str
	email:str
	password:str

@app.post("/api/user",response_class=JSONResponse) #註冊新會員
async def signup(response:Response,signup:Signup):
	result=userModel.signup(signup)
	return userView.signupResult(response,result)

class Signin(BaseModel):
	email:str
	password:str

@app.put("/api/user/auth")#登入會員帳戶
async def signin(response:Response,signin:Signin):
	result=userModel.signin(signin)
	return userView.signinResult(response,result)

bearer_token=HTTPBearer()
async def get_current_token(credentials:HTTPAuthorizationCredentials=Security(bearer_token)):
	token=credentials.credentials
	return token

@app.get("/api/user/auth") #取得當前登入的會員資訊
async def check_authorization(token:str =Depends(get_current_token)):
	return await userModel.check_auth(token)

class Booking(BaseModel):
	attractionId:int
	date:str
	time:str
	price:int
	
@app.get("/api/booking")#取得預定行程
def booking(response:Response,booking:Booking,token:str =Depends(get_current_token)):
	result=bookingModel.getBooking(booking,token)
	return bookingView.getBooking(response,result)

class NewBooking(BaseModel):
	attractionId:int
	date:str
	time:str
	price:int
@app.post("api/booking")#建立新預定行程
def booking(response:Response,newbooking:NewBooking,token:str =Depends(get_current_token)):
	result=bookingModel.confirmBooking(newbooking,token)
	return bookingView.confirmBooking(response,result)

@app.delete("api/booking")#刪除預定行程
def booking(request:Request,response:Response,token:str =Depends(get_current_token)):
	result=bookingModel.deleteBooking(request,token)
	return bookingView.deleteBooking(response,result)

