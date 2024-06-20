import cv2
import numpy as np
import sys
import json
import os
import time

def process_image_by_color(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError('Image not found')

    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    color_ranges = {
        'red': ([0, 50, 50], [10, 255, 255]),
        'orange': ([10, 50, 50], [20, 255, 255]),
        'yellow': ([20, 50, 50], [35, 255, 255]),
        'green': ([35, 50, 50], [90, 255, 255]),
        'blue': ([90, 50, 50], [140, 255, 255]),
        'purple': ([140, 50, 50], [170, 255, 255]),
        'black': ([0, 0, 0], [180, 255, 30]),
    }

    result_files = []

    for color, (lower, upper) in color_ranges.items():
        lower_color = np.array(lower)
        upper_color = np.array(upper)
        
        color_mask = cv2.inRange(hsv_image, lower_color, upper_color)
        color_points = cv2.bitwise_and(image, image, mask=color_mask)
        
        contours, _ = cv2.findContours(color_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(color_points, contours, -1, (255, 0, 0), thickness=2)
        
        overlay = cv2.addWeighted(image, 0.75, color_points, 0.5, 0)
        
        timestamp = int(time.time())
        random_string = ''.join(np.random.choice(list('abcdefghijklmnopqrstuvwxyz0123456789'), 3))
        result_filename = f'{color}_output_{timestamp}_{random_string}.png'
        result_path = os.path.join('uploads', result_filename)
        cv2.imwrite(result_path, overlay)
        result_files.append(result_filename)

    return result_files

if __name__ == "__main__":
    image_path = sys.argv[1]
    result_files = process_image_by_color(image_path)
    print(json.dumps(result_files))
