import requests
username = 'raphaeld'
url = 'https://' + username + '.cartodb.com/api/v2/sql'
sql = {'q':'SELECT process_data()'}
res = requests.post(url, data=sql)
print(res.text)