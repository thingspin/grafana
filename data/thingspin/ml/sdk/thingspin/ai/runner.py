import paho.mqtt.client as paho 
import thingspin.ai.session
import json

class ModelManager:

    def __init__(self, session, loader, inferencer):
        print("ModelManager initializing")

        self.model = None
        self.session = session
        
        # Custom Infer Function
        self.load = loader
        self.inferencer = inferencer

        # MQTT
        self.client = paho.Client()
        self.client.on_message = self.__do

        # MQTT connection
        try:
            self.client.connect(session.mqtt.host, session.mqtt.port)
        except Exception as e:
            print("message bus could not initiated. : " + session.mqtt.host + ":" + session.mqtt.port)
            print(e)
            raise

    def run(self):
        # both mqtt input and output
        if self.session.option == 0:
            try:
                self.model = self.load(self.session.folder.model)
            except Exception as e:
                raise e

            try:
                self.client.subscribe(self.session.mqtt.topic.wait, qos=2)
                print("wait live data on toptic " + self.session.mqtt.topic.wait + "...")
                print("out live data on toptic " + self.session.mqtt.topic.out + "...")
            except Exception as e:
                raise e

            self.client.loop_forever()
        # only mqtt output
        elif self.session.option == 1:
            try:
                if self.model == None:
                    self.model = self.load(self.session.folder.model)
                result = self.inferencer(self.model, None, None)
            except Exception as e:
                print(e)
                pass
            else:
                # mqtt publish
                if result != None:
                    # default info for mqtt output
                    result["cid"] = self.session.cid
                    result["project"] = self.session.cname

                    print("result : " + json.dumps(result))
                    print("out live data on toptic " + self.session.mqtt.topic.out + "...")
                    (rc, mid) = self.client.publish(self.session.mqtt.topic.out, json.dumps(result))
                else:
                    print("Inference failed.")
    
    def stop(self):
        self.client.unsubscribe(self.session.mqtt.topic.wait)
        print("Stop!")

    def __do(self, client, userdata, msg):
        #print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))

        # call back inference algorithm
        try:
            #(msg.payload).decode('ascii')
            data = json.loads(msg.payload)
             
            result = self.inferencer(self.model, self.session.folder, data)
            
            result["cid"] = self.session.cid
            result["project"] = self.session.cname

            if 'uuid' in data:
                result["uuid"] = data["uuid"]
            if 'camera' in data:
                result["camera"] = data["camera"]

            print("result : " + json.dumps(result))
        except Exception as e:
            print(e)
            pass
        else:
            # mqtt publish
            if result != None:
                #print(self.session.mqtt.topic.out)
                (rc, mid) = self.client.publish(self.session.mqtt.topic.out, json.dumps(result), qos=2)
            else:
                print("Inference failed.")
