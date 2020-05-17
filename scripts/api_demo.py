import requests
import json 
import pprint

topic_id = "0.0.46939"

url = 'http://api.testnet.kabuto.sh/v1/topic/' + topic_id + '/message'

headers = {'accept': 'application/json'}

response = requests.request("GET", url, headers=headers)

response = json.loads(response.text)
pp = pprint.PrettyPrinter(indent=4)
pp.pprint(response['messages'][0])

index = 0
while True:
    try:
        pp.pprint(response['messages'][index])
        index+=1
    except IndexError:
        break

