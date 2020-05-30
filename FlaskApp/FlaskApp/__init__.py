#! /usr/lib/python3
from flask import Flask, jsonify, request
from flask_cors import CORS

import mysql.connector
import json

import sys

import functools
import os
from authlib.integrations.requests_client import OAuth2Session
import google.oauth2.credentials
import googleapiclient.discovery
import google_auth

import json
import time
import math
import requests
from datetime import date, datetime, timedelta

import types


app = Flask(__name__)
CORS(app)

app.secret_key = 'notverysecret'

app.register_blueprint(google_auth.app)


@app.route("/log", methods=["GET"])
def index():
	#Check if user is logged in
    if google_auth.is_logged_in():
	#get user info
	user_info = google_auth.get_user_info()
	#use its info for the welcome page
        return json.dumps(user_info, indent=4)
    return 'You are not logged in'

@app.route("/test", methods=["GET"])
def hello():
    return jsonify(name="sven")

@app.route("/select", methods=["GET"])
def select():
    # connect to databse
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        passwd="svenisagooddog",
	database="alacrity"
    )

    # execute query
    mycursor = mydb.cursor()
    mycursor.execute(request.args.get("query"), request.args.get("values"))

    # parse result
    if (request.args.get("n") == None):
        results = mycursor.fetchall()
    else:
        results = mycursor.fetchmany(size=request.args.get("n"))

    response = list()

    for result in results:
        response.append(dict(zip(mycursor.column_names, result)))

    # return formatted response
    return format_output(response)

@app.route("/insert", methods=["POST", "GET"])
def insert():
    # connect to database
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        passwd="svenisagooddog",
	    database="alacrity"
    )

    # execute query
    mycursor = mydb.cursor()

    values = json.loads(request.args.get("values"))

    # parse output
    if (isinstance(values[0], list)):
        formatted_values = list()

        for value in values:
            formatted_values.append(tuple(value))

        mycursor.executemany(request.args.get("query"), formatted_values)

    else:
        formatted_values = tuple(values)
        mycursor.execute(request.args.get("query"), formatted_values)

    mydb.commit()

    # return formatted result
    return json.dumps({"id" : mycursor.lastrowid})

@app.route("/delete", methods=["POST"])
def delete():
    # connect to database
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        passwd="svenisagooddog",
	    database="alacrity"
    )

    # execute query
    mycursor = mydb.cursor()
    mycursor.execute(request.args.get("query"), request.args.get("values"))

    mydb.commit()

    # return formatted result
    return json.dumps({"rows deleted" : mycursor.rowcount})

@app.route("/update", methods=["POST"])
def update():
    # connect to database
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        passwd="svenisagooddog",
	    database="alacrity"
    )

    # execute query
    mycursor = mydb.cursor()
    mycursor.execute(request.args.get("query"), request.args.get("values"))

    mydb.commit()

    # return formatted result
    return json.dumps({"rows updated" : mycursor.rowcount})


def format_output(output):
    return json.dumps(output, indent=4, sort_keys=True, default=str)

def lastScheduleTime(blockList, givenDate):
    lastTime = 7
    for block in blockList:
        print("given date " + str(givenDate)[0:11] + " block date " + str(block["block_date"])[0:11])
        if (str(givenDate)[0:11] == str(block["block_date"])[0:11]):
            blockHr = int(block["block_date"][11:13])
            print("blkhr " + str(blockHr))
            if (blockHr > lastTime):
                lastTime = blockHr
    return lastTime

# Return a task of the first block in a given date

def firstTask(blockList, taskList, givenDate):
    for block in blockList:
        if (block["block_date"][0:10] == str(givenDate) and int(block["block_date"][11:12]) == 8 and block["locked"] == 0):
            taskID = block["task_id"]
            for task in taskList:
                if (task["id"] == taskID):
                    return task

    return 0

# Return a first time block in a given date

def firstBlock(blockList, givenDate):
    for block in blockList:
        if (block["block_date"][0:10] == str(givenDate) and int(block["block_date"][11:12]) == 8):
            return block
    return 0

# Delete time info from the blocks (helper function)

def trimTime(blockList):
    newBlockList =[]
    for block in blockList:
        block["block_date"] = block["block_date"][0:10]
        newBlockList.append(block)
    print(newBlockList)
    return newBlockList

def daterange(start_date, end_date):
            for n in range(int ((end_date - start_date).days)):
                yield start_date + timedelta(n)


@app.route("/optimize", methods=["POST"])
def task_optimization():
     # Python JSON to dict (parse)

    task = request.get_json()     

    task_id = task['id']
    task_due = task['due_date']
    task_hours = task['total_hours']
    task_user = task['user_id']
    task_name = task['name']

    # Create a task table (contains all the task info) by parsing multiple JSON objects from file

    tasksList = []
    response = requests.get("http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT * FROM tasks WHERE user_id = " + request.args.get("user_id") + "&values=null")
    if response.status_code == 200:
        responseData = json.loads(response.content.decode('utf-8'))
        for t in responseData:
            tasksList.append(t)

    # Create a block table (contains all the block info) by parsing multiple JSON objects from file

    query = "http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT * FROM time_blocks WHERE"

    for tsk in tasksList:
	query = query + " task_id = \"" + str(tsk['id']) + "\" OR"

    query = query[:-3]
    query = query + "&values=null"
    blocksList = []
    if len(tasksList) > 0:
    	response = requests.get(query)
    	if response.status_code == 200:
            responseData = json.loads(response.content.decode('utf-8'))
            for t in responseData:
                blocksList.append(t)

    blocksPerDay = {}
    newBlockList = []
	
    # Add time info to the blocks (schedule starts from 8 am)

    for block in blocksList:
        date = block["block_date"]
        print(blocksPerDay)
        if (date in blocksPerDay):
            hour = ""
            if 8 + int(blocksPerDay[block["block_date"]]) < 10:
                hour = "0" + str(8 + int(blocksPerDay[block["block_date"]]))
            else:
                hour = str(8 + int(blocksPerDay[block["block_date"]]))
            block["block_date"] = block["block_date"] + " " + hour + ":00" + ":00"
            blocksPerDay[date] += block["length_minutes"] / 60
        else:
            block["block_date"] = block["block_date"] + " 08" + ":00" + ":00"
            blocksPerDay[date] = block["length_minutes"] / 60

        newBlockList.append(block)

    blocksList = newBlockList
    newBlockList = []

    # Assign date and length in minutes of blocks

    block_num = int(task_hours)
    assign_datetime = datetime.today()
    #return task['due_date']
    due = datetime.strptime(task['due_date'], '%Y-%m-%d %H:%M:%S')
    today3pm = datetime.now().replace(hour=15, minute=0, second=0, microsecond=0)

    if (datetime.today() > today3pm):
        assign_datetime = datetime(datetime.today().year, datetime.today().month, datetime.today().day) + timedelta(days=1)
    else:
        assign_datetime = datetime(datetime.today().year, datetime.today().month, datetime.today().day)

    # Find date with minimum # of things to do
    for i in range (0, block_num):

        # If current time is before 3pm, assign block from today
        # Else if current time is after 3pm, assign block from tomorrow
        numBlocksMap = {}

        for block in blocksList:
            if str(block["block_date"])[0:10] in numBlocksMap:
                numBlocksMap[str(block["block_date"])[0:10]] += 1
            else:
                numBlocksMap[str(block["block_date"])[0:10]] = 1

        bestDate = datetime.today().strftime("%Y-%m-%d")
        if str(bestDate)[0:10] in numBlocksMap:
            minBlocks = numBlocksMap[str(bestDate)[0:10]]
        else:
            minBlocks = 0
        

        start_date = datetime.today()
        end_date = due
	for single_date in daterange(start_date, end_date):
            if single_date.strftime("%Y-%m-%d") in numBlocksMap:
                if numBlocksMap[single_date.strftime("%Y-%m-%d")] < minBlocks:
                    minBlocks = numBlocksMap[single_date.strftime("%Y-%m-%d")]
                    bestDate = single_date.strftime("%Y-%m-%d")
            else:
                if minBlocks != 0:
                    minBlocks = 0
                    bestDate = single_date.strftime("%Y-%m-%d")

        # Assign a time block and update the block list (outside of the while loop)
        if (len(newBlockList) == 0):
            new_id = 0
        else:
            new_id = int(newBlockList[len(newBlockList)-1]['id']) + 1
        
        new_block = {"id": str(new_id), "task_id": task['id'], "length_minutes": "60", "block_date": str(bestDate), "locked": "0"}
        newBlockList.append(new_block)
	blocksList.append(new_block)
    
    # If outside of the for loop, then all blocks assigned successfully
    return jsonify(newBlockList)


if __name__ == "__main__":
    app.run()
