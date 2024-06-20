import cv2
import numpy as np
import sys
import json
import os
import time
from sklearn.cluster import KMeans

def find_dominant_colors(image, k=9):
    pixels = image.reshape((-1, 3))
    pixels = np.float32(pixels)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    _, _, palette = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    return palette

def is_white(color, threshold=200, sat_threshold=50):
    return color[2] > threshold and color[1] < sat_threshold

def adjust_brightness(image, factor):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    v = cv2.add(v, factor)
    v = np.clip(v, 0, 255)
    final_hsv = cv2.merge((h, s, v))
    image = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)
    return image

def process_image_by_dominant_colors(image_path, k=9):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError('Image not found')

    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    dominant_colors = find_dominant_colors(hsv_image, k=k)
    
    result_files = []

    dark_image = adjust_brightness(image, -40)

    for color in dominant_colors:
        if is_white(color):
            continue

        if  (20 < color[0] < 40):
            lower_color = np.array([max(0, color[0] - 15), max(30, color[1] - 100), max(30, color[2] - 100)])
            upper_color = np.array([min(179, color[0] + 15), min(255, color[1] + 100), min(255, color[2] + 100)])
        elif (40 <= color[0] < 100):
            lower_color = np.array([max(0, color[0] - 5), max(50, color[1] - 50), max(50, color[2] - 50)])
            upper_color = np.array([min(179, color[0] + 5), min(255, color[1] + 50), min(255, color[2] + 50)])
        elif (80 <= color[0] < 140):
            lower_color = np.array([max(0, color[0] - 15), max(30, color[1] - 100), max(30, color[2] - 100)])
            upper_color = np.array([min(179, color[0] + 15), min(255, color[1] + 50), min(255, color[2] + 50)])
        elif (110 <= color[0] <= 200):
            lower_color = np.array([max(0, color[0] - 11), max(30, color[1] - 60), max(30, color[2] - 80)])
            upper_color = np.array([min(179, color[0] + 11), min(255, color[1] + 60), min(255, color[2] + 80)])
        else:
            continue 
        
        color_mask = cv2.inRange(hsv_image, lower_color, upper_color)
        
        kernel = np.ones((6,6), np.uint8)
        color_mask = cv2.morphologyEx(color_mask, cv2.MORPH_CLOSE, kernel)
        color_mask = cv2.morphologyEx(color_mask, cv2.MORPH_OPEN, kernel)
        
        contours, _ = cv2.findContours(color_mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        output_image = dark_image.copy()
        
        selected_mask = np.zeros_like(image)
        cv2.drawContours(selected_mask, contours, -1, (255, 255, 255), thickness=cv2.FILLED)
        selected_mask_gray = cv2.cvtColor(selected_mask, cv2.COLOR_BGR2GRAY)

        selected_region = cv2.bitwise_and(image, image, mask=selected_mask_gray)
        bright_region = adjust_brightness(selected_region, 0)

        inverted_mask = cv2.bitwise_not(selected_mask_gray)
        darkened_background = cv2.bitwise_and(output_image, output_image, mask=inverted_mask)
        output_image = cv2.add(darkened_background, bright_region)

        cv2.drawContours(output_image, contours, -1, (50, 255, 50), 2)
        
        timestamp = int(time.time())
        random_string = ''.join(np.random.choice(list('abcdefghijklmnopqrstuvwxyz0123456789'), 3))
        result_filename = f'output_{timestamp}_{random_string}.png'
        result_path = os.path.join('uploads', result_filename)
        cv2.imwrite(result_path, output_image)
        result_files.append(result_filename)

    return result_files

if __name__ == "__main__":
    image_path = sys.argv[1]
    result_files = process_image_by_dominant_colors(image_path)
    print(json.dumps(result_files))
