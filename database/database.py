import mysql.connector
import json

mydb

# Connects to the database server
# Needs to be called before database access
def config():
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        passwd="svenisagooddog"
    )

# Inserts a row into a table
# request: json formated srting with feilds query and values
# Returns the id of the inserted row
# Syntax (like printf from C):
#   query:  INSERT INTO [table name] ([column name 0], [column name 1], ... , [column name N]) VALUES (%s, %s, ..., %s)
#   values: [[value0], [value1], ..., [valueN]]
# To insert one row, values should be a list. To insert multiple rows, values
# should be a list of lists.
def insert(request):
    request_dict = json.loads(request)

    mycursor = mydb.cursor()
    mycursor.execute(request_dict.get(query), request_dict.get(values))

    mydb.commit()

    ret_val = {"id" : mycursor.lastrowid}
    return json.dumps(ret_val)

# Reads data from a table
# request: json formated srting with feilds query, values (optional) and n (optional)
# Returns a list of tuples (each representing one row)
# If n is not None, returns the first n results of the query
# If n is None, returns all the results of the query
# Syntax (like printf from C):
#   To select everything from a table (* means everything):
#       query: SELECT * FROM [table name]
#   To select data from certain columns:
#       query: SELECT [column name 0], [column name 1], ..., [column name n] FROM [table name]
#   To fliter the data:
#       append "WHERE [column name] = [target value]" to the end of query
#   To filter string data with wild cards (% is the wildcard symbol):
#       append "WHERE [column name with string data] LIKE "%[target word]%"" to the end of query
#   To sort results in ascending order:
#       append "ORDER BY [column name]" to the end of query
#   To sort results in descending order:
#       append "ORDER BY [column name] DESC" to the end of query
def select(request):
    request_dict = json.loads(request)

    mycursor = mydb.cursor()
    mycursor.execute(request_dict.get(query), request_dict.get(values))

    if (request_dict.get(n) == None):
        ret_val = {"result" : mycursor.fetchall()}
        return json.dumps(ret_val)
    else:
        ret_val = {"result" : mycursor.fetchmany(size=n)}
        return json.dumps(ret_val)

# Deletes row(s) from a table
# request: json formated srting with feilds query and values (optional)
# Returns the number of rows deleted
# Syntax:
#   same as select all but replace SELECT with DELETE and remove *
def delete(request):
    request_dict = json.loads(request)

    mycursor = mydb.cursor()
    mycursor.execute(request_dict.get(query), request_dict.get(values))

    mydb.commit()

    ret_val = {"rows deleted" : mycursor.rowcount}
    return json.dumps(ret_val)

# Updates values in a table
# request: json formated srting with feilds query and values (optional)
# Returns the number of rows updated
# Syntax:
#   query: UPDATE [table name] SET [column] = [new value]
#  To only update certain rows, use the same syntax as filtering in select_all
def update(request):
    request_dict = json.loads(request)

    mycursor = mydb.cursor()
    mycursor.execute(request_dict.get(query), request_dict.get(values))

    mydb.commit()

    ret_val = {"rows updated" : mycursor.rowcount}
    return json.dumps(ret_val)
