from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from getData import get_data,get_mysql_connection
import mysql.connector
from mysql.connector import pooling
from fastapi.staticfiles import StaticFiles
import json
import os

app=FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
get_data()
db=get_mysql_connection()
pool=mysql.connector.pooling.MySQLConnectionPool(
		pool_name="myPool",
		pool_size=5,
		**db
	)

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
		sql_keyword="select * from (select * from att where mrt= %s or name like %s) as subquery limit %s offset %s"
		val_keyword=(keyword,('%'+keyword+'%'),12,(page*12))
		cursor.execute(sql_keyword,val_keyword)
		results_keyword=cursor.fetchall()
		results_page=output_pages(results_keyword,1)	
		nextpage=findNextPage(sql_keyword,page,cursor,keyword)
	else:
		sql_attractions="select * from att limit %s offset %s"
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
	# print(results_id)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
#函式區	
def output_pages(results,case):
	# print(len(results))
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