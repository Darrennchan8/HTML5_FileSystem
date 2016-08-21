"""
Encodes all directories into a json for installation.
Requires Python 3.x.
"""
import os
import json
import base64

PATH = "/xampp/htdocs/HTML5_FileSystem/resources"
OUTPUT_PATH = "/xampp/htdocs/HTML5_FileSystem/public/resources.json"
POST_PATH = "/"
FILES = {}
RECURSIVE = []

def get_file_contents(_path):
    """Returns File Contents"""
    file_contents = open(_path, 'rb').read()
    file_contents = base64.b64encode(file_contents).decode()
    return file_contents
def handle_path(__path, file_name):
    """Gets all files"""
    if os.path.isfile(__path):
        FILES[POST_PATH + file_name] = get_file_contents(__path)
    elif os.path.isdir(__path):
        FILES[POST_PATH + file_name] = {}
        RECURSIVE.append(__path)
    else:
        raise ValueError('\''+__path+"' is neither a file or folder, or doesn't exist...")
    print("loaded "+POST_PATH+file_name)
def scan():
    """Main method for encoding"""
    global POST_PATH
    source = os.listdir(PATH + POST_PATH)
    for i in source:
        handle_path(PATH + POST_PATH + i, i)
    if len(RECURSIVE) != 0:
        POST_PATH = RECURSIVE.pop(0)[len(PATH):] + '/'
        scan()
scan()

print("Converting to JSON...")
ENCODED_FILE = json.dumps(FILES)
print("Writing file...")
open(OUTPUT_PATH, 'w+').write(ENCODED_FILE)
print("Done!")
