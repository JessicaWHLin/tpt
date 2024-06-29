import mysql.connector
import mysql.connector.pooling
import json
import os
import re
from mysql.connector import Error
# db={}
def get_mysql_connection():
	# 從環境變數中獲取 MySQL 連接參數
	host = os.getenv('MYSQL_HOST')
	user = os.getenv('MYSQL_USER')
	password = os.getenv('MYSQL_PASSWORD')
	database = os.getenv('MYSQL_DATABASE')
	db={
		"host":host,
		"user":user,
		"password":password,
		"database":database
	}
	pool=mysql.connector.pooling.MySQLConnectionPool(
		pool_name="myPool",
		pool_size=5,
		**db
	)
	return pool
def get_data():
	pool=get_mysql_connection()

	current_path=os.getcwd()
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
	connection.commit()
	cursor.close()
	connection.close()

# get_data()
# get_mysql_connection()
# print(get_mysql_connection())