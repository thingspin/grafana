import os
import sys
import json
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

import tensorflow as tf
config = tf.ConfigProto()
config.gpu_options.allow_growth = True
tfsession = tf.Session(config=config)

class MqttTopic:
    _base = None
    _inPrx = None
    _outPrx = None

    wait = None
    out = None

class MqttInfo:
    brocker = None
    host = None
    port = None
    topic = MqttTopic()

class StorageInfo:
    _cwd = None
    data = None
    project = None
    model = None
    image = None
    
    def __init__(self):
        self._cwd = os.getcwd()
        print(self._cwd)

class Session:
    cid = None
    cname = None
    mqtt = MqttInfo()
    folder = StorageInfo()
    option = None

def Initialize(option, xargs = sys.argv[1], force = False):

    # if xargs is None:
    #     xargs = sys.argv[1:]
    # else:

    try:
        params = json.loads(xargs)
    except Exception:
        if force == False:
            print("setup file load failed.")
            return None

    sess = Session()

    try:
        sess.option = option
        sess.cid = params["cid"]
        sess.cname = params["cname"]

        ml = json.loads(params["mlSetting"])
        mqtt = ml["mqtt"]

        sess.mqtt.brocker = mqtt["brocker"]
        sess.mqtt.host = sess.mqtt.brocker.split(":")[0]
        sess.mqtt.port = int(sess.mqtt.brocker.split(":")[1])

        sess.mqtt.topic._base = mqtt["base"]
        sess.mqtt.topic._inPrx = mqtt["inprefix"]
        sess.mqtt.topic._outprefix = mqtt["outprefix"]

        sess.mqtt.topic.wait = sess.mqtt.topic._base + "/" + sess.cid + "/" + sess.mqtt.topic._inPrx + "/#"
        sess.mqtt.topic.out = sess.mqtt.topic._base + "/" + sess.cid + "/" + sess.mqtt.topic._outprefix

        ##store = ml["storage"]
        ##sess.folder.base = store["base"]
        ##sess.folder.data = store["data"]
        sess.folder.data = sess.folder._cwd + "/data"
        sess.folder.images = sess.folder.data + "/thingspin/images"
        sess.folder.project = sess.folder.data + "/thingspin/ml/config/" + sess.cid
        sess.folder.model = sess.folder.project + "/model"
        sess.folder.algorithm = sess.folder.project + "/algorithm"

    except Exception as e:
        if force == False:
            print("setup parameters are invalid.")
            print(e)
            return None

    return sess

    #sess.model = loadmodelFunc(modelPath)