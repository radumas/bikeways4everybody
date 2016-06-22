import requests
import logging
import json
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
username = 'raphaeld'
url = 'https://' + username + '.cartodb.com/api/v2/sql'
sql = {'q':'SELECT process_data();'}
logger.info('Pinging {url} with query: {sql}'.format(url=url,sql=sql['q']))
res = requests.post(url, data=sql)
resj = res.json()
errors = resj.get('error', 'No errors')
if errors == 'No errors':  
    logger.info('Query completed in: %s', resj.get('time'))
else:
    logger.warning('Error: %s', errors)