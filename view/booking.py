class bookingView:
	def getBooking(response,result):
		if result.error == True:
			response.status_code=403
		return result
	
	def confirmBooking(response,result):
		if result.error==True:
			if result.message=="Missing booking data":
				response.status_code=400
			elif result.message =="Un-signin":
				response.status_code=403
		return result
	def deleteBooking(response,result):
		if result.error:
			if result.message=="invaild id":
				response.status_code=400
			elif result.message=="Un-signin":
				response.status_code=403
		return result