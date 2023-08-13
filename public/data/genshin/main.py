import json


with open('characters.json', 'r+') as f:
    data = json.load(f)
    for _ in data['data']:
        keys = ('object_type', 'display_name', 'constellations', 'talents', 'link')
        
        for key in keys:
            if _.get(key):
                del _[key]
    
    print(data)
