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

def findDue(block, taskList):
    for task in taskList:
        if (task["task_id"] == block["task_id"]):
            return datetime.strptime(task["due_date"], '%Y-%m-%d %H:%M:%S')

@app.route("/optimize", methods=["POST"])
def task_optimization():

    # Python JSON to dict (parse)

    task = request.get_json()     

    task_id = task['id']
    task_due = task['due_date']
    task_hours = task['total_hours']
    task_user = task['user_id']
    task_name = task['name']

    # print("Printing a target task for optimization")
    # print(task_id + " " + task_due + " " + task_hours + " " + task_user + " " + task_name)
    # print("-----------------------------------------------------")

    # Create a task table (contains all the task info) by parsing multiple JSON objects from file

    tasksList = []
    response = requests.get("http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT * FROM tasks WHERE user_id = " + request.args.get("user_id") + "&values=null")
    if response.status_code == 200:
        responseData = json.loads(response.content.decode('utf-8'))
        for t in responseData:
            tasksList.append(t)

    # print("Printing each JSON Decoded Object: Tasks")
    # for tasks in tasksList:
    #    print(tasks["id"], tasks["due_date"], tasks["total_hours"], tasks["user_id"], tasks["name"])
    # print("-----------------------------------------------------")

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

    # print("Printing each JSON Decoded Object: Blocks")
    # for blocks in blocksList:
    #     print(blocks["id"], blocks["task_id"], blocks["length_minutes"], blocks["block_date"], blocks["locked"])
    # print("-----------------------------------------------------")
    # print("Schedule Optimization")

    # Assign date and length in minutes of blocks

    block_num = int(task_hours)
    assign_datetime = datetime.today()
    due = datetime.strptime(task['due_date'], '%Y-%m-%d %H:%M:%S')
    today3pm = datetime.now().replace(hour=15, minute=0, second=0, microsecond=0)

    # print("Current datetime is " + str(datetime.today()))
    # print("We'll find available timeslot from " + str(assign_datetime))

    # If the current time is before 3pm, assign time blocks from today
    # Else if current time is after 3pm, assign time blocks from tomorrow

    if (datetime.today() > today3pm):
        assign_datetime = datetime(datetime.today().year, datetime.today().month, datetime.today().day) + timedelta(days=1)
    else:
        assign_datetime = datetime(datetime.today().year, datetime.today().month, datetime.today().day)

    # Assign the time blocks of the given task

    ret = []
    for i in range (0, block_num):
        numBlocksMap = {}

        # Get the number of time blocks for each day and find the best date and its block number

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

	ret.append(numBlocksMap)
    loopret = [start_date, end_date]

	for single_date in daterange(start_date, end_date):
	    loopret.append(numBlocksMap[single_date.strftime("%Y-%m-%d")])

            if single_date.strftime("%Y-%m-%d") in numBlocksMap:
                if numBlocksMap[single_date.strftime("%Y-%m-%d")] < minBlocks:
                    minBlocks = numBlocksMap[single_date.strftime("%Y-%m-%d")]
                    bestDate = single_date.strftime("%Y-%m-%d")
            else:
                if minBlocks != 0:
                    minBlocks = 0
                    bestDate = single_date.strftime("%Y-%m-%d")

        # Update the block list

        if (len(newBlockList) == 0):
            new_id = 0
        else:
            new_id = int(newBlockList[len(newBlockList)-1]['id']) + 1
        
        new_block = {"id": str(new_id), "task_id": task['id'], "length_minutes": "60", "block_date": str(bestDate), "locked": "0"}
        newBlockList.append(new_block)
	    blocksList.append(new_block)

        # print("Block assigned: " + str(newBlockList[len(newBlockList)-1]))
    
    # After all the blocks assigned successfully, optimize the overall schedule
    # To spread out the time blocks, check if there's any date more than 3 blocks

    current = datetime.today()
    while (current < due):

        # Find the total # of hours of things to do (current date)

        task_hours = 0
        for block in blocksList:
            if (block["block_date"] == str(current[0:10])):
                task_hours = task_hours + int(block["length_minutes"]) / 60

        # If more than 4 hours assigned on the same day, find a block that can be moved

        move_block = new_block
        if (task_hours >= 4):
            for block in blocksList:
                if (block["block_date"] == str(current[0:10]) and findDue(block, tasksList) > due):
                    if (block["locked"] == 0):
                        move_block = block

        # If an available block exists, then move to another day with less than 3 hour schedule

        if not(move_block == new_block):
            move_date = current
            while (move_date < datetime.strptime(move_block["due_date"], '%Y-%m-%d %H:%M:%S')):
                task_hours = 0
                for block in blocksList:
                    if (block["block_date"] == str(move_date[0:10])):
                        task_hours = task_hours + int(block["length_minutes"]) / 60

                # Move the block and update the list

                if (task_hours < 3):           
                    for block in blocksList:
                        if (block["id"] == move_block["id"]):
                            block["block_date"] = str(move_date[0:10])
                    for block in newBlockList:
                        if (block["id"] == move_block["id"]):
                            block["block_date"] = str(move_date[0:10])                            
                    break

                else:
                    move_date = move_date + timedelta(days=1)

    current = current + timedelta(days=1)
 
    # Time blocks and schedule optimization completed

<<<<<<< HEAD
target_task = '{"id": "291", "due_date": "2020-04-07 23:59:59", "total_hours": "3", "user_id": "0215", "name": "Alacrity"}'
blocksList = task_optimization(target_task)
=======
    print("Time Blocks Assigned Successfully!")
    return trimTime(newBlockList)
>>>>>>> 63ca502c579ef28390fe7dfec5718f8d4904aaa7
