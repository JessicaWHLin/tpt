from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from getData import get_data
import mysql.connector
from mysql.connector import pooling
import json
app=FastAPI()
db={
		"host":"localhost",
		"user":"test2",
		"password":"1234",
		"database":"tpt"
	}
pool=mysql.connector.pooling.MySQLConnectionPool(
		pool_name="myPool",
		pool_size=5,
		**db
	)
get_data()

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
	connection=pool.get_connection()
	cursor=connection.cursor(dictionary=True)
	if(keyword):
		sql_keyword="select * from att where mrt= %s or name like %s"
		val_keyword=(keyword,('%'+keyword+'%'))
		cursor.execute(sql_keyword,val_keyword)
		results_keyword=cursor.fetchall()
		output_pages(results_keyword,results_page,page)
		
	else:
		sql_attractions="select * from att"
		cursor.execute(sql_attractions)
		results_all=cursor.fetchall()
		output_pages(results_all,results_page,page)

	cursor.close()
	connection.close()		
	return {"nextPage":page+1,"data":results_page}


@app.get("/api/attraction/{attractionId}",response_class=JSONResponse)
async def attractionId(request:Request, attractionId:int):
	results_page=[]
	connection=pool.get_connection()
	cursor=connection.cursor(dictionary=True)
	sql_id="select * from att where id =%s"
	val_id=(attractionId,)
	cursor.execute(sql_id,val_id)
	results_id=cursor.fetchall()
	# print(results_id)
	if results_id == []:
		return JSONResponse(status_code=400,content={"error": True,"message":"景點編號不正確"})
	else:
		output_pages(results_id,results_page,0)
		cursor.close()
		connection.close()
		return{"data":results_page}

@app.get("/api/mrts",response_class=JSONResponse)
async def rankMrts(request:Request):
	connection=pool.get_connection()
	cursor=connection.cursor(dictionary=True)
	sql_query="select mrt from att group by mrt order by count(*) desc;"
	cursor.execute(sql_query)
	result_mrt=cursor.fetchall()
	result_mrts=[]
	for i in range(len(result_mrt)):
		result_mrts.append(result_mrt[i]["mrt"])
	cursor.close()
	connection.close()
	return{"data":result_mrts}

#函式區	
def output_pages(results,results_page,page):
	for i in range(len(results)):
		if (i+1)%12==0:
			results[i]["current_page"]=((i+1)//12)-1
		else:
			results[i]["current_page"]=(i+1)//12

	for i in range(len(results)):
		image_urls=json.loads(results[i]["images"])
		if results[i]["current_page"]==page:
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
	return results_page