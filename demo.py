import redis
import sys
import random
import string
import time
import datetime

def binarySearch (arr,l,r, x):
    if r >= l:
        mid = l + (r - l)/2
        if arr[mid] == x:
            return mid
        elif arr[mid] > x:
            return binarySearch(arr, l, mid-1, x)
        else:
            return binarySearch(arr, mid + 1, r, x)
    else:
        return -1

def randomString(stringLength=10):
    """Generate a random string of fixed length """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))

def searchBy(r):
    flag = raw_input("You want to search by?: (ID/name/gender/age)")
    item = raw_input("What is your search item?: ")
    #
    start_time = time.time()
    #
    queryIn = r.sort("ID",by=str("student_*->"+flag),get=str("student_*->"+flag),alpha=True)
    queryID = r.sort("ID",by=str("student_*->"+flag),get=str("student_*->ID"),alpha=True)
    ans = binarySearch(queryIn,0,len(queryIn)-1,item)
    if x>=0:
        print("result: ")
        print(r.hgetall('student_'+str(int(queryID[ans])+0)))
    else:
        print("search item cannot be found")
    #
    print("--- %s seconds ---" % (time.time() - start_time))
    #
    return mainMenu(r)

def dataStream(r):
    while True:
        r.xadd("fakestream",{"time":str(datetime.datetime.now())})
        time.sleep(2)
    return mainMenu(r)

def mainMenu(r):
    print("\nRedis data data structure demo")
    print("press 1 for print table")
    print("press 2 to add new profile")
    print("press 3 to sort table by certain attribute")
    print("press 4 to delete profile")
    print("press 5 to search item")
    print("press 6 to start data stream")
    print("press 0 to exite")
    input = raw_input("Enter your input: ")
    if input=="1":
        printAll(r)
    elif input=="2":
        addProfile(r)
    elif input=="3":
        sortBy(r)
    elif input=="4":
        deleteProfile(r)
    elif input=="5":
        searchBy(r)
    elif input=="6":
        dataStream(r)
    elif input=="0":
        return
    else:
        print("invalid input")
        return mainMenu(r)

def deleteProfile(r):
    dIndex = raw_input("which profile index you want to delete: ")
    #
    start_time = time.time()
    #
    flag0 = r.delete(str("student_"+dIndex))
    flag1 = r.lrem("ID",1,dIndex)
    if flag0<=0:
        print("delete failed. Not an index or profile does not exist")
    else:
        print("delete successful")
    #
    print("--- %s seconds ---" % (time.time() - start_time))
    #
    return mainMenu(r)

def printAll(r):
    #
    start_time = time.time()
    #
    for x in r.lrange("ID",0,-1):
        print(r.hgetall('student_'+x))
    print(r.lrange("ID",0,-1))
    #
    print("--- %s seconds ---" % (time.time() - start_time))
    #
    return mainMenu(r)

def addProfile(r):
    size = r.lrange("ID",-1,-1)
    print(size)
    newName = raw_input("Enter new student name: ")
    newGender = raw_input("Enter new student gender(male/female): ")
    newAge = raw_input("Enter new student age: ")
    #
    start_time = time.time()
    #
    r.rpush("ID",int(size[0])+1)
    r.hset("student_"+str(ids[x]),"name",newName)
    r.hset("student_"+str(ids[x]),"gender",newGender)
    r.hset("student_"+str(ids[x]),"age",newAge)
    r.hset("student_"+str(ids[x]),"log-in",0)
    r.hset("student_"+str(ids[x]),"ID",int(size[0])+1)

    print("add successfully")
    #
    print("--- %s seconds ---" % (time.time() - start_time))
    #
    return mainMenu(r)

def sortBy(r):
    flag = raw_input("sort by? (ID,age,name,gender): ")
    #
    start_time = time.time()
    #
    print("ID: ",r.sort("ID",by=str("student_*->"+flag),alpha=True))
    print("name: ",r.sort("ID",by=str("student_*->"+flag),get="student_*->name",alpha=True))
    print("gender: ",r.sort("ID",by=str("student_*->"+flag),get="student_*->gender",alpha=True))
    print("age: ",r.sort("ID",by=str("student_*->"+flag),get="student_*->age",alpha=True))
    #
    print("--- %s seconds ---" % (time.time() - start_time))
    #
    return mainMenu(r)



r = redis.Redis()
r.flushall()#reset redis
#start data generating
benchmark_size = 5
names = []
genders = []
ages = []
ids = []
logins = [0]*benchmark_size

print("initializing with instance size: ", benchmark_size)
print("... ... ... ... ... ...")
#
start_time = time.time()
#
for x in range(benchmark_size):
    genders.append(random.choice(["male","female"]))
    names.append(randomString(5))
    ages.append(random.randint(18,100))
    ids.append(x)
    r.rpush("ID",int(ids[x]))
    r.hset("student_"+str(ids[x]),"name",str(names[x]))
    r.hset("student_"+str(ids[x]),"gender",str(genders[x]))
    r.hset("student_"+str(ids[x]),"age",int(ages[x]))
    r.hset("student_"+str(ids[x]),"log-in",str(logins[x]))
    r.hset("student_"+str(ids[x]),"ID",int(ids[x]))

print("initialization complete!")
#
print("--- %s seconds ---" % (time.time() - start_time))
#

mainMenu(r)
