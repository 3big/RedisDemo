--[[
KEYS[1]:entry pattern
KEYS[2]:search field
KEYS[3]:search value
]]

local result = {}
local entryList = redis.call("scan",0,"MATCH",KEYS[1],"COUNT",100000)
entryList = entryList[2]
for i = 1, table.getn(entryList), 1
do
  local hashRes = redis.call("hget",entryList[i],KEYS[2])
  if hashRes == KEYS[3] then
    table.insert(result,entryList[i])
    table.insert(result,hashRes)
  end
end
return result
