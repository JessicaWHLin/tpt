class userView:
	def signupResult(response,result):
		if result =="ok":
			return {"ok":True}
		elif result =="existed":
			response.status_code=400
			return {"error":True,"message":"電子信箱已被註冊"}
		else:
			return Exception
	def signinResult(response,result):
		if result==None:
			response.status_code=400
			return {"error":True, "message":"無此會員email"} 
		elif result == "wrong":
			response.status_code=400
			return {"error":True, "message":"密碼錯誤"} 
		else:
			return result
		