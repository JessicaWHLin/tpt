from module.paging import output_pages
class attractionView:
	def render(response,results_id):
		if results_id == None:
			response.status_code=400
			return {"error": True,"message":"景點編號不正確"}
		else:
			results_page=output_pages(results_id,0)
			return{"data":results_page}
	