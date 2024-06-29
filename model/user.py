from module.getData import get_mysql_connection
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError
from typing import Union

SECRET_KEY="c0a1445f1d52c2b5ab8a"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_DAYS=7
password_context= CryptContext(schemes=["bcrypt"])

class userModel:
	def signup(signup):
		pool=get_mysql_connection()
		email=signup.email
		name=signup.name
		password=signup.password
		try:
			connection4=pool.get_connection()
			cursor=connection4.cursor()
			sql_query="select * from member where email =%s "
			val_query=(email,)
			cursor.execute(sql_query,val_query)
			result=cursor.fetchone()
		except:
			return "error"
		
		if result is None:
			try:
				sql_signup="insert into member(name,email,password)values(%s,%s,%s)"
				val_signup=(name,email,get_password_hash(password))
				cursor.execute(sql_signup,val_signup)
				connection4.commit()
				return "ok"
			except:
				return "error"
			finally:
				cursor.close()
				connection4.close()
		else:
			return "existed"
	
	def signin(signin):
		email=signin.email
		password=signin.password
		user=authenticate_user(email,password)
		if user == None or user == "wrong":
			return user
		access_token_expires=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
		# print("access_token_expires=",access_token_expires)
		access_token=create_access_token({"email":user["email"]},access_token_expires)
		return {"Token":access_token}

	async def check_auth(token):
		if(token):
			user=await get_current_user(token)
			if user is not None:
				# print("user=",user)
				result={"id":user["id"],"name":user["name"],"email":user["email"]}
			else:
				result=None
			return{"data":result}
		else:
			return {"data":None}







def verify_password(plain_password,hashed_password): #驗證密碼
	return password_context.verify(plain_password,hashed_password)

def get_password_hash(password): #雜湊密碼
	return password_context.hash(password)

def authenticate_user(email:str,password:str):
	user=get_user(email)
	if not user:
		return None
	if not verify_password(password,user["password"]):
		return "wrong"
	return user

def get_user(email:str): #檢查資料庫有沒有這個Email會員
	try:
		pool=get_mysql_connection()
		sql_email="select id, name,email,password from member where email=%s"
		val_email=(email,)
		connection5=pool.get_connection()
		cursor=connection5.cursor(dictionary=True)
		cursor.execute(sql_email,val_email)
		result=cursor.fetchone()
	except:
		return Exception
	finally:
		cursor.close()
		connection5.close()
	if result is not None:
		return result
	else:
		return None
	
def create_access_token(data:dict,expires_delta:Union[timedelta,None]=None): #建立token
	to_encode=data.copy()
	if expires_delta:
		expire=datetime.now(timezone.utc)+expires_delta
	else:
		expire=datetime.now(timezone.utc)+timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
	to_encode.update({"exp":expire})
	# print("to_encode",to_encode)
	encoded_jwt=jwt.encode(to_encode,SECRET_KEY, algorithm=ALGORITHM)
	return encoded_jwt

async def get_current_user(token:str):
	try:
		token_decoded=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
		if token_decoded is None:
			return None
		# print("token_decoded=",token_decoded)
	except InvalidTokenError:
			return None
	user=get_user(token_decoded["email"])
	if user is None:
		return None
	return user