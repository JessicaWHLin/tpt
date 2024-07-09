from model.user import userModel
from module.getData import get_mysql_connection
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
import os
load_dotenv("key.env")
PARTNER_KEY=os.getenv("PARTNER_KEY")
print("key=",PARTNER_KEY)

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
	
	async def preBooking(data,token):
		user= await userModel.check_auth(token)
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
	
	async def paying(request,token):
		user= await userModel.check_auth(token)
		if user["data"] is not None:	
			try:
				pool=get_mysql_connection()
				connection9=pool.get_connection()
				cursor=connection9.cursor()
				
				current_date = datetime.now().strftime("%Y%m%d%H%M%S")
				order_number=f"{current_date}{user["data"]["id"]}"
				sql_record="""
					insert into orders(attractionId,userId,amount,bookingDate,bookingTime,contact_name,
					contact_email,contact_phone,order_number)values(%s,%s,%s,%s,%s,%s,%s,%s,%s) 
				"""
				val_record=(request.order.trip.attraction.id,user["data"]["id"],request.order.price,request.order.trip.date,request.order.trip.time,
					request.order.contact.name,request.order.contact.email,request.order.contact.phone_number,order_number)
				cursor.execute(sql_record,val_record)
				cursor.fetchone()
				connection9.commit()
				#成立order就移除booking
				sql_clearBooking="delete from booking where userId=%s"
				val_clearBooking=(user["data"]["id"],)
				cursor.execute(sql_clearBooking,val_clearBooking)
				cursor.fetchone()
				connection9.commit()					
				details = f"AttractionId: {request.order.trip.attraction.id},Attraction: {request.order.trip.attraction.name}, Address: {request.order.trip.attraction.address}"
				url="https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
				headers={
					"content-type":"application/json",
					"x-api-key":PARTNER_KEY
				}
				data={
					"prime":request.prime,
					"amount":request.order.price,
					"merchant_id":"kittensea1205_FUBON_POS_3",
					"details":details,
					"partner_key":PARTNER_KEY,
					"cardholder":request.order.contact.dict(),
					"order_number":order_number
				}
				response=requests.post(url,headers=headers,json=data)
				response_data=response.json()

				if response_data["status"] != 0:
					return{"error":True,"result":response_data,"order_number":order_number}
				cursor.close()
				connection9.close()
				return{"ok":True,"result":response_data}	
			except:
				return{"error":True,"message":Exception}
		else:
			return {"error":True,"message":"Un-signin"}
		
	def confirmPaying(result):
		pool=get_mysql_connection()
		connection10=pool.get_connection()
		cursor=connection10.cursor()
		if "ok" in result and result["ok"] is True:
			sql_payment="""
				insert into payments(
				order_number,
				rec_trade_id,
				bank_transaction_id,
				auth_code,
				amount,
				currency,
				status,
				transaction_time,
				card_last_four,
				card_bin_code,
				card_country,
				bank_result_code,
				bank_result_msg)
				values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
				"""
			val_payment=(
				result["result"]["order_number"],
				result["result"]["rec_trade_id"],
				result["result"]["bank_transaction_id"],
				result["result"]["auth_code"],
				result["result"]["amount"],
				result["result"]["currency"],
				result["result"]["status"],
				result["result"]["transaction_time_millis"],
				result["result"]["card_info"]["last_four"],
				result["result"]["card_info"]["bin_code"],
				result["result"]["card_info"]["country"],
				result["result"]["bank_result_code"],
				result["result"]["bank_result_msg"]
				)
		elif "error" in result and "result" in result:
			sql_payment="""
				insert into payments(
				order_number,
				rec_trade_id,
				status,
				bank_result_code,
				bank_result_msg)
				values(%s,%s,%s,%s,%s)
				"""
			val_payment=(
				result["order_number"],
				result["result"]["rec_trade_id"],
				result["result"]["status"],
				result["result"]["bank_result_code"],
				result["result"]["bank_result_msg"]
				)
		else:
			return result
		cursor.execute(sql_payment,val_payment)
		cursor.fetchone()
		connection10.commit()

		if result["result"]["status"]==0:
			sql_paid="update orders set status=%s where order_number=%s "
			val_paid=("paid",result["result"]["order_number"])
			cursor.execute(sql_paid,val_paid)
			cursor.fetchone()
			connection10.commit()
			sql_find_userId="select userId from orders where order_number=%s"
			val_find_userId=(result["result"]["order_number"],)
			cursor.execute(sql_find_userId,val_find_userId)
			cursor.fetchone()
			number=result["result"]["order_number"],

		else:
			number=result["order_number"]
		data={
			"number":number,
			"payment":{
				"status":result["result"]["status"],
				"message":result["result"]["msg"]
			}
		}
		cursor.close()
		connection10.close()
		return {"data":data}

		
	async def getOrderInfo(orderNumber,token):
		user= await userModel.check_auth(token)
		if user["data"] is not None:
			try:
				pool=get_mysql_connection()
				connection11=pool.get_connection()
				cursor=connection11.cursor(dictionary=True)
				sql_query="""
					select att.name,att.images,att.address, orders.bookingDate, orders.bookingTime
					from orders join att
					on orders.attractionId=att.id
					where orders.order_number=%s
					"""
				val_query=(orderNumber,)
				cursor.execute(sql_query,val_query)
				result=cursor.fetchone()
				image_urls=json.loads(result["images"])
				image_url=image_urls["image"][0]
				data={
					"order_number":orderNumber,
					"name":result["name"],
					"address":result["address"],
					"image":image_url,
					"date":result["bookingDate"],
					"time":result["bookingTime"]
				}
				cursor.close()
				connection11.close()
				return {"data":data}
			except:
				return {"error":True,"message":Exception}
				
		else:
			return {"error":True,"message":"Un-signin"}
		
