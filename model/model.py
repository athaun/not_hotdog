#!/usr/bin/python

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
#os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

import tensorflow_datasets as tfds
import matplotlib.pyplot as plt
import tensorflow as tf
import numpy as np
import pickle
import cv2

import keras
from keras.layers import Dense, Activation, Conv2D, Flatten, Dropout, MaxPool2D
from keras.preprocessing.image import ImageDataGenerator
from keras.callbacks import ModelCheckpoint, EarlyStopping
from keras.models import Sequential

import random
import sys

MODEL_SAVE = 'checkpoint/hotdog.h5'
HIST_SAVE = 'checkpoint/hist'
INPUT_SHAPE = (128, 128, 1)
TARGET_ACCURACY = 0.95

TRAIN_DATA_GEN = ImageDataGenerator(
        rescale=1./255,
        horizontal_flip=True,
)

VALID_DATA_GEN = ImageDataGenerator(
        rescale=1./255,
        horizontal_flip=True,
)

TEST_DATA_GEN = ImageDataGenerator(
        rescale=1./255,
)

TRAIN_GEN = TRAIN_DATA_GEN.flow_from_directory(
    '../model/data/sanitized/train',
    target_size=(128, 128),
    batch_size=32,
    class_mode='binary',
    color_mode='grayscale',
)

VALID_GEN = VALID_DATA_GEN.flow_from_directory(
    '../model/data/sanitized/valid',
    target_size=(128, 128),
    batch_size=32,
    class_mode='binary',
    color_mode='grayscale',
)

TEST_GEN = TEST_DATA_GEN.flow_from_directory(
    '../model/data/sanitized/test',
    target_size=(128, 128),
    batch_size=32,
    class_mode='binary',
    color_mode='grayscale',
)

TRAIN_STEPS = TRAIN_GEN.n // TRAIN_GEN.batch_size
VALID_STEPS = VALID_GEN.n // VALID_GEN.batch_size
TEST_STEPS = TEST_GEN.n // TEST_GEN.batch_size

CHECKPOINT = ModelCheckpoint(
    filepath=MODEL_SAVE,
    verbose=1,
    save_best_only=True,
)

EARLY_STOP  = EarlyStopping(
    monitor='loss',
    patience=20,
    mode='auto',
    verbose=1,
    restore_best_weights=True,
)

def gen_model(cont: bool):
    print('Generating model...')

    model = Sequential([
        Conv2D(
            16,
            1,
            activation='relu',
            input_shape=INPUT_SHAPE,
            padding='same',
        ),
        Conv2D(
            16,
            1,
            activation='relu',
            padding='same',
        ),
        MaxPool2D(pool_size=(1, 1)),
        Dropout(0.25),

        Conv2D(
            16,
            1,
            activation='relu',
            padding='same',
        ),
        Conv2D(
            16,
            1,
            activation='relu',
            padding='same',
        ),
        MaxPool2D(pool_size=(1, 1)),
        Dropout(0.50),

        Flatten(),
        Dense(256, activation='relu'),
        Dropout(0.6),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(1, activation='sigmoid'),
    ])

    model.compile(
        loss='binary_crossentropy',
        optimizer='adam',
        metrics=['binary_accuracy']
    )

    if not cont:
        print('Loading from save...')
        model.load_weights(MODEL_SAVE)
        with open(HIST_SAVE, 'rb') as hist_file:
            return model, pickle.load(hist_file)

    if os.path.exists(MODEL_SAVE):
        print('Resuming progress...')
        model.load_weights(MODEL_SAVE)

    history = model.fit(
            TRAIN_GEN,
            steps_per_epoch=TRAIN_STEPS,
            epochs=0,
            validation_data=VALID_GEN,
            validation_steps=VALID_STEPS,
            verbose=1,
            callbacks=[CHECKPOINT, EARLY_STOP],
        )

    print('Training done, dumping...')
    
    model.save_weights('checkpoint/hotdog.ckpt')
    with open(HIST_SAVE, 'wb') as hist_file:
        pickle.dump(history, hist_file)

    return model, history


def plot_progress(history) -> None:
    plt.plot(history.history['binary_accuracy'])
    plt.plot(history.history['val_binary_accuracy'])
    plt.ylabel('accuracy')
    plt.xlabel('epoch')
    plt.show()

def main() -> None:
    print(TRAIN_GEN.class_indices)
    model, history = gen_model(True)

    img = cv2.imread(r"F:\not_hotdog\uploaded_images\img_" + sys.argv[1] + ".png", cv2.IMREAD_GRAYSCALE) / 255.0
    img = tf.convert_to_tensor(img, dtype=tf.float32)
    img = tf.reshape(img, (1, 128, 128, 1))
    print(img.shape)
    print(model.predict(img, verbose=1))

if __name__ == '__main__':
    main()
