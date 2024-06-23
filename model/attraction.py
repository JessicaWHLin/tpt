from module.getData import get_mysql_connection
from module.paging import *
class attractionModel:
	def get(attractionId):
		try:		
			pool=get_mysql_connection()
			connection2=pool.get_connection()
			cursor=connection2.cursor(dictionary=True)
			sql_id="select * from att where id =%s"
			val_id=(attractionId,)
			cursor.execute(sql_id,val_id)
			return  cursor.fetchone()
		except:
			return Exception
		finally:
			cursor.close()
			connection2.close()	
	
	def searchAttraction(page,keyword=""):
		pool=get_mysql_connection()
		connection1=pool.get_connection()
		cursor=connection1.cursor(dictionary=True)
		if(keyword):
			sql_keyword="select * from (select * from att where mrt= %s or name like %s) as subquery order by category desc limit %s offset %s"
			val_keyword=(keyword,('%'+keyword+'%'),12,(page*12))
			cursor.execute(sql_keyword,val_keyword)
			results=cursor.fetchall()
			
			results_page=output_pages(results,1)	
			nextpage=findNextPage(sql_keyword,page,cursor,keyword)
		else:
			sql_attractions="select * from att order by category desc limit %s offset %s"
			val_attractions=(12,(page*12))
			cursor.execute(sql_attractions,val_attractions)
			results=cursor.fetchall()
			results_page=output_pages(results,1)
			nextpage=findNextPage(sql_attractions,page,cursor,keyword)
		cursor.close()
		connection1.close()	
		return {"nextPage":nextpage,"data":results_page}
		
	def mrts():
		pool=get_mysql_connection()
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




