class userView:
	def signupResult(response,result):
		if result =="ok":
			return {"ok":True}
		elif result =="existed":
			response.status_code=400
			return {"error":True,"message":"電子信箱已被註冊"}
		elif result["error"] is True:
			if result["message"]=="SQL issue":
				response.status_code=500
			else:
				response.status_code=400
			return result
		
	def signinResult(response,result):
		if result==None:
			response.status_code=400
			return {"error":True, "message":"無此會員email"} 
		elif result == "wrong":
			response.status_code=400
			return {"error":True, "message":"密碼錯誤"} 
		else:
			return result
	def updateInfo(response,result):
			if "error" in result and result["error"]==True:
				if result["message"]=="Un-signin":
					response.status_code=403
				elif result["message"]==Exception:
					response.status_code=500
				else:
					response.status_code=400
			return result
	def upload_photo(response,result):
		if "error" in result and result["error"]==True:
				if result["message"]=="Un-signin":
					response.status_code=403
				elif result["message"]==Exception:
					response.status_code=500
				else:
					response.status_code=400
		return result

		