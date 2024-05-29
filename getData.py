import mysql.connector
import json
import os
import re

def get_data():
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

	current_path=os.path.dirname(os.path.abspath(__file__))
	f_path=os.path.join(current_path,'data','taipei-attractions.json')
	with open(f_path, mode="r",encoding='utf-8') as f:
		data=json.load(f)
	attractions=[]
	for i in range(len(data["result"]["results"])):
		attractions.append([i+1,data["result"]["results"][i]["name"],data["result"]["results"][i]["CAT"],data["result"]["results"][i]["description"],data["result"]["results"][i]["address"],data["result"]["results"][i]["direction"],data["result"]["results"][i]["MRT"],data["result"]["results"][i]["latitude"],data["result"]["results"][i]["longitude"]])

	pattern =re.compile(r"https?://\S+?\.(?:jpg|JPG)")
	images=[]
	files=[]
	for i in range(len(data["result"]["results"])):
		files=pattern.findall(data["result"]["results"][i]["file"])
		images.append(files)
	
	for i in range(len(images)):
		image_json=json.dumps({"image":images[i]})
		attractions[i].append(image_json)

	connection=pool.get_connection()
	cursor=connection.cursor()
	sql0="select * from att where id =1"
	cursor.execute(sql0)
	if cursor.fetchone() ==None:
		sql1="insert into att(id,name,category,description,address,transport,mrt,lat,lng,images)values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
		val1=(attractions)
		cursor.executemany(sql1,val1)

	# sql_id="select id from att"
	# cursor.execute(sql_id)
	# results=cursor.fetchall()
	# print(results)
	connection.commit()
	cursor.close()
	connection.close()

# get_data()