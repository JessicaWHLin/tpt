from model.user import userModel
from module.getData import get_mysql_connection
import json
class bookingModel:
	async def getBooking(token):
		user= await userModel.check_auth(token)
		if user["data"] is not None:
			try:
				pool=get_mysql_connection()
				connection6=pool.get_connection()
				sql_attraction="""
				select booking.id,userId,attractionId,bookingDate,bookingTime,price,
				name, address,images from att 
				join booking on att.id=booking.attractionId
				where booking.userId=%s
				"""
				val_attraction=(user["data"]["id"],)
				cursor=connection6.cursor(dictionary=True)
				cursor.execute(sql_attraction,val_attraction)
				attraction=cursor.fetchone()
			except:
				return {"error":True,"message":Exception}
			finally:
				cursor.close()
				connection6.close()
			if attraction is not None:
				image_urls=json.loads(attraction["images"])
				image_url=image_urls["image"][0]
			else:
				return {"data": None}
			
			result={
				"attraction":{
					"id":attraction["attractionId"],
					"name":attraction["name"],
					"address":attraction["address"],
					"image":image_url
				},
				"date":attraction["bookingDate"],
				"time":attraction["bookingTime"],
				"price":attraction["price"],
			}
			return{"data":result}
		else:
			return {"error":True,"message":"Un-signin"}
	
	async def confirmBooking(data,token):
		user= await userModel.check_auth(token)
		print("user in confirmBooking=",user)
		if not data.date or not data.time or not data.price or not data.attractionId:
			return {"error":True,"message":"Missing booking data"}
		if user["data"] is not None:
			try:
				pool=get_mysql_connection()
				connection7=pool.get_connection()
				cursor=connection7.cursor()
				sql_check="select * from booking where userId=%s"
				val_check=(user["data"]["id"],)
				cursor.execute(sql_check,val_check)
				result_check=cursor.fetchone()
				if result_check is None:
					sql_newbooking="insert into booking(userId,attractionId,bookingDate,bookingTime,price)values(%s,%s,%s,%s,%s)"
					val_newbooking=(user["data"]["id"],data.attractionId,data.date,data.time,data.price)
					cursor.execute(sql_newbooking,val_newbooking)

				else:
					sql_update="""
						update booking 
						set attractionId=%s,bookingDate=%s,bookingTime=%s,price=%s
						where userId=%s
					"""
					val_udpate=(data.attractionId,data.date,data.time,data.price,user["data"]["id"])
					cursor.execute(sql_update,val_udpate)
			except:
				return {"error":True,"message":Exception}
			finally:
				connection7.commit()
				cursor.close()
				connection7.close()
			return{"ok":True}
		else:
			return {"error":True,"message":"Un-signin"}
	
	async def deleteBooking(token):
		user= await userModel.check_auth(token)
		if user["data"] is not None:
			try:
				pool=get_mysql_connection()
				connection8=pool.get_connection()
				sql_delete="delete from booking where userId=%s"
				val_delete=(user["data"]["id"],)
				cursor=connection8.cursor()
				cursor.execute(sql_delete,val_delete)
				connection8.commit()
			except:
				return {"error":True,"message":Exception}
			finally:
				cursor.close()
				connection8.close()
			return{"ok":True}
		else:
			return {"error":True,"message":"Un-signin"}