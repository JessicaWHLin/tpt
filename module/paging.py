
import json

def output_pages(results,case):
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