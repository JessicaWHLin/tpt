from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from module.getData import get_data,get_mysql_connection
import mysql.connector
from mysql.connector import pooling
from fastapi.staticfiles import StaticFiles
import json
from pydantic import BaseModel
import jwt
from jwt.exceptions import InvalidTokenError
from typing import Annotated, Union
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone

app=FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
get_data()
db=get_mysql_connection()
pool=mysql.connector.pooling.MySQLConnectionPool(
		pool_name="myPool",
		pool_size=5,
		**db
	)

SECRET_KEY="c0a1445f1d52c2b5ab8a"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_DAYS=7
password_context= CryptContext(schemes=["bcrypt"])

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
async def attractions(request: Request, page:int=0 , keyword: str |None = None):
	results_page=[]
	connection1=pool.get_connection()
	cursor=connection1.cursor(dictionary=True)
	if(keyword):
		sql_keyword="select * from (select * from att where mrt= %s or name like %s) as subquery order by category desc limit %s offset %s"
		val_keyword=(keyword,('%'+keyword+'%'),12,(page*12))
		cursor.execute(sql_keyword,val_keyword)
		results_keyword=cursor.fetchall()
		results_page=output_pages(results_keyword,1)	
		nextpage=findNextPage(sql_keyword,page,cursor,keyword)
	else:
		sql_attractions="select * from att order by category desc limit %s offset %s"
		val_attractions=(12,(page*12))
		cursor.execute(sql_attractions,val_attractions)
		results_all=cursor.fetchall()
		results_page=output_pages(results_all,1)
		nextpage=findNextPage(sql_attractions,page,cursor,keyword)
	
	cursor.close()
	connection1.close()	
	return {"nextPage":nextpage,"data":results_page}


@app.get("/api/attraction/{attractionId}",response_class=JSONResponse)
async def attractionId(request:Request, attractionId:int):
	results_page=[]
	connection2=pool.get_connection()
	cursor=connection2.cursor(dictionary=True)
	sql_id="select * from att where id =%s"
	val_id=(attractionId,)
	cursor.execute(sql_id,val_id)
	results_id=cursor.fetchone()
	if results_id == None:
		return JSONResponse(status_code=400,content={"error": True,"message":"景點編號不正確"})
	else:
		results_page=output_pages(results_id,0)
		cursor.close()
		connection2.close()
		return{"data":results_page}

@app.get("/api/mrts",response_class=JSONResponse)
async def rankMrts(request:Request):
	connection3=pool.get_connection()
	cursor=connection3.cursor(dictionary=True)
	sql_query="select mrt from att where mrt is not null group by mrt order by count(*) desc;"
	cursor.execute(sql_query)
	result_mrt=cursor.fetchall()
	result_mrts=[]
	for i in range(len(result_mrt)):
		result_mrts.append(result_mrt[i]["mrt"])
	cursor.close()
	connection3.close()
	return{"data":result_mrts}
class Signup(BaseModel):
	name: str
	email:str
	password:str

@app.post("/api/user",response_class=JSONResponse) #註冊新會員
async def signup(request:Request,signup: Signup):
	email=signup.email
	name=signup.name
	password=signup.password
	connection4=pool.get_connection()
	cursor=connection4.cursor()
	sql_query="select * from member where email =%s "
	val_query=(email,)
	cursor.execute(sql_query,val_query)
	result=cursor.fetchone()
	if result is None:
		sql_signup="insert into member(name,email,password)values(%s,%s,%s)"
		val_signup=(name,email,get_password_hash(password))
		cursor.execute(sql_signup,val_signup)
		connection4.commit()
		cursor.close()
		connection4.close()
		return {"ok":True}
	else:
		return JSONResponse(status_code=400,content={"error": True,"message":"電子信箱已被註冊"})

class Signin(BaseModel):
	email:str
	password:str

@app.put("/api/user/auth",response_class=JSONResponse)#登入會員帳戶
async def signin(request:Request,signin:Signin):
	email=signin.email
	password=signin.password
	user=authenticate_user(email,password)
	if not user:
		return JSONResponse(status_code=400,content={"error": True,"message":"登入失敗"})
	access_token_expires=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
	print("access_token_expires=",access_token_expires)
	access_token=create_access_token({"email":user["email"]},expires_delta=access_token_expires)
	return {"Token":access_token}


@app.get("/api/user/auth",response_class=JSONResponse) #取得當前登入的會員資訊
async def check_authorization(request:Request,token:str):
	user= await get_current_user(token)
	if user is not None:
		print("user=",user)
		result={"id":user["id"],"name":user["name"],"email":user["email"]}
	else:
		result=user
	return{"data":result}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
#函式區	
def output_pages(results,case):
	results_page=[]
	if case==1:
		for i in range(len(results)):
			image_urls=json.loads(results[i]["images"])
			attractions={
				"id":results[i]["id"],
				"name":results[i]["name"],
				"category":results[i]["category"],
				"description":results[i]["description"],
				"address":results[i]["address"],
				"transport":results[i]["transport"],
				"mrt":results[i]["mrt"],
				"lat":results[i]["lat"],
				"lng":results[i]["lng"],
				"images":image_urls["image"]
			}
			results_page.append(attractions)
	else:
		image_urls=json.loads(results["images"])
		attractions={
				"id":results["id"],
				"name":results["name"],
				"category":results["category"],
				"description":results["description"],
				"address":results["address"],
				"transport":results["transport"],
				"mrt":results["mrt"],
				"lat":results["lat"],
				"lng":results["lng"],
				"images":image_urls["image"]
		}
		results_page=attractions	
	return results_page

def findNextPage(sql,page,cursor,keyword):
	if(keyword):
		val_next_check=(keyword,('%'+keyword+'%'),13,(page*12))
	else:
		val_next_check=(13,page*12)
	cursor.execute(sql,val_next_check)
	result_nextpage_check=cursor.fetchall()
	if len(result_nextpage_check)<13:
		result=None
	else:
		result=page+1
	return result

def verify_password(plain_password,hashed_password):
	return password_context.verify(plain_password,hashed_password)

def get_password_hash(password):
	return password_context.hash(password)

def get_user(email:str):
	sql_email="select id, name,email,password from member where email=%s"
	val_email=(email,)
	connection5=pool.get_connection()
	cursor=connection5.cursor(dictionary=True)
	cursor.execute(sql_email,val_email)
	result=cursor.fetchone()
	cursor.close()
	connection5.close()
	print(result)
	if result is not None:
		user=result
		return user
	else:
		return None
	
def authenticate_user(email:str,password:str):
	user=get_user(email)
	if not user:
		return False
	if not verify_password(password,user["password"]):
		return False
	return user

def create_access_token(data:dict,expires_delta:Union[timedelta,None]=None): #建立token
	to_encode=data.copy()
	if expires_delta:
		expire=datetime.now(timezone.utc)+expires_delta
	else:
		expire=datetime.now(timezone.utc)+timedelta(days=14)
	to_encode.update({"exp":expire})
	encoded_jwt=jwt.encode(to_encode,SECRET_KEY, algorithm=ALGORITHM)
	return encoded_jwt

async def get_current_user(token:str):
	try:
		token_decoded=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
		if token_decoded is None:
			return None
	except InvalidTokenError:
			return None
	user=get_user(token_decoded["email"])	
	if user is None:
		return None
	return user
