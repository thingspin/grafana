###################################################################################################################
### ThingSPIN Edge AI SDK Sample
###################################################################################################################
import thingspin.ai.session as session
import thingspin.ai.runner as runner

import sys
import json

###################################################################################################################
def callback_loadModel(path):

    print("TensorFlow model will be loaded from " + path)

    import tflearn
    from tflearn.layers.core import input_data, dropout, fully_connected
    from tflearn.layers.conv import conv_2d, max_pool_2d
    from tflearn.layers.estimator import regression
    from tflearn.data_preprocessing import ImagePreprocessing
    from tflearn.data_augmentation import ImageAugmentation

    img_prep = ImagePreprocessing()
    img_prep.add_featurewise_zero_center()
    img_prep.add_featurewise_stdnorm()
    img_aug = ImageAugmentation()
    img_aug.add_random_flip_leftright()
    img_aug.add_random_rotation(max_angle=25.)
    img_aug.add_random_blur(sigma_max=3.)

    network = input_data(shape=[None, 32, 32, 3], data_preprocessing=img_prep, data_augmentation=img_aug)
    network = conv_2d(network, 32, 3, activation='relu')
    network = max_pool_2d(network, 2)
    network = conv_2d(network, 64, 3, activation='relu')
    network = conv_2d(network, 64, 3, activation='relu')
    network = max_pool_2d(network, 2)
    network = fully_connected(network, 512, activation='relu')
    network = dropout(network, 0.5)
    network = fully_connected(network, 2, activation='softmax')
    network = regression(network, optimizer='adam', loss='categorical_crossentropy', learning_rate=0.001)

    name = "bird-classifier.tfl"
    checkpoint = path + "/" + name + ".ckpt"
    fullpath = checkpoint + "-50912"

    model = tflearn.DNN(network, tensorboard_verbose=0, checkpoint_path=checkpoint)
    model.load(fullpath)

    return model

###################################################################################################################
def callback_Inference(model, folders, data):
    import scipy
    import numpy as np

    # show strage info
    # print(json.dumps(vars(folders),sort_keys=True, indent=4))
    
    # show data info
    # print(data)

    # Load the image file
    picture = folders.images + "/" + data["folder"] + "/" + data["image"]
    print("processing for " + picture + " ...")

    img = None
    try:
        img = scipy.ndimage.imread(picture, mode="RGB")
    except:
        return None

    try:
        img = scipy.misc.imresize(img, (32, 32), interp="bicubic").astype(np.float, casting='unsafe')
    except:
        return None

    prediction = None
    try:
        # Predict
        prediction = model.predict([img])
        np.argmax(prediction[0])
    except:
        return None

    isBird = False
    if np.argmax(prediction[0]) == 1:
        isBird = True
    else:
        isBird = False

    # construct result as json format as your needs.
    result = {
        "folder": data["folder"],
        "image": data["image"],
        "isBird": isBird
    }

    return result

###################################################################################################################
### Main Entrypoint
###################################################################################################################
sess = session.Initialize()
if sess is None:
   print("oops!")
   exit()

worker = runner.ModelManager(sess, callback_loadModel, callback_Inference)
if worker is None:
   print("oops!")
   exit()

try:
    worker.run()
except Exception:
   print("oops!")
   exit()

print("Well done!")
exit()
