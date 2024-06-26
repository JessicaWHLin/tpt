from model.user import userModel
from module.getData import get_mysql_connection
class bookingModel:
	async def getBooking(data,token):
		user= await userModel.check_auth(token)
		print("user in getBooking api=",user)
		if user is not None:
			try:
				pool=get_mysql_connection()
				connection6=pool.get_connection()
				sql_attraction="select id, name, address, images from att where id=%s"
				val_attraction=((data.attractionId),)
				cursor=connection6.cursor(dictionary=True)
				cursor.execute(sql_attraction,val_attraction)
				attraction=cursor.fetchone()
			except:
				return Exception
			finally:
				cursor.close()
				connection6.close()
			
			result={
				"attraction":{
					"id":data.id,
					"name":attraction.name,
					"address":attraction.address,
					"image":attraction.images.image[0]
				},
				"date":data.date,
				"time":data.time,
				"price":data.price
			}
			return{"data":result}
		else:
			return {"error":True,"message":"Un-signin"}
	
	async def confirmBooking(data,token):
		user= await userModel.check_auth(token)
		print("user in confirmBooking api=",user)
		if user is not None:
			try:
				pool=get_mysql_connection()
				connection7=pool.get_connection()
				sql_newbooking="insert into booking(userId,attractionId,bookingDate,bookingTime,price)values(%s,%s,%s,%s,%s)"
				val_newbooking=(user.id,data.id,data.date,data.time,data.price)
				cursor=connection7.cursor()
				cursor.execute(sql_newbooking,val_newbooking)
				result=cursor.fetchone()
				if result is None:
					return {"error":True,"message":"Missing booking data"}
				
			except:
				return Exception
			finally:
				connection7.commit()
				cursor.close()
				connection7.close()
			return{"ok":True}
		else:
			return {"error":True,"message":"Un-signin"}
	
	async def deleteBooking(request,token):
		user= await userModel.check_auth(token)
		print("user in delete api=",user)
		if user is not None:
			try:
				pool=get_mysql_connection()
				connection8=pool.get_connection()
				sql_delete="delete from booking where id=%s"
				val_delete=(request,)
				cursor=connection8.cursor()
				cursor.execute(sql_delete,val_delete)
				result=cursor.fetchone()
				if result is None:
					return{"error":True,"message":"invaild id"}
			except:
				return Exception
			finally:
				connection8.commit()
				cursor.close()
				connection8.close()
			return{"ok":True}
		else:
			return {"error":True,"message":"Un-signin"}