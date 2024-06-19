import cv2
import numpy as np
import sys
import json
import os
import time

def find_closest_contour(contours, point):
    min_dist = float('inf')
    closest_contour = None
    for contour in contours:
        dist = cv2.pointPolygonTest(contour, point, True)
        if dist >= 0 and dist < min_dist:
            min_dist = dist
            closest_contour = contour
    return closest_contour

def adjust_brightness(image, factor):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    v = cv2.add(v, factor)
    v = np.clip(v, 0, 255)
    final_hsv = cv2.merge((h, s, v))
    image = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)
    return image

def process_image(image_path, markers):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError('Image not found')

    dark_image = adjust_brightness(image, -35)
    output = dark_image.copy()

    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    for marker in markers:
        x, y = int(marker['x']), int(marker['y'])
        color = get_color_at_point(hsv_image, (x, y))
        mask = create_mask_from_color(hsv_image, color, tolerance=85)

        # print(f"Processing marker at ({x}, {y}) with color {color}", file=sys.stderr)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            print(f"No contours found for color {color} at ({x}, {y})", file=sys.stderr)
            continue

        closest_contour = find_closest_contour(contours, (x, y))

        if closest_contour is not None:
            selected_mask = np.zeros_like(image)
            cv2.drawContours(selected_mask, [closest_contour], -1, (255, 255, 255), thickness=cv2.FILLED)
            selected_mask_gray = cv2.cvtColor(selected_mask, cv2.COLOR_BGR2GRAY)

            selected_region = cv2.bitwise_and(image, image, mask=selected_mask_gray)

            bright_region = adjust_brightness(selected_region, 0)

            inverted_mask = cv2.bitwise_not(selected_mask_gray)
            darkened_background = cv2.bitwise_and(output, output, mask=inverted_mask)
            output = cv2.add(darkened_background, bright_region)

            cv2.drawContours(output, [closest_contour], -1, (50, 255, 50), 4)
            # print(f"Drew contour for marker at ({x}, {y})", file=sys.stderr)
        else:
            print(f"No closest contour found for marker at ({x}, {y}) with color {color}", file=sys.stderr)

    timestamp = int(time.time())
    random_string = ''.join(np.random.choice(list('abcdefghijklmnopqrstuvwxyz0123456789'), 3))
    result_filename = f'output_{timestamp}_{random_string}.png'
    result_path = os.path.join('uploads', result_filename)
    cv2.imwrite(result_path, output)
    return result_path

def get_color_at_point(image, point):
    h, s, v = image[point[1], point[0]]
    return h, s, v

def create_mask_from_color(image, color, tolerance=77):
    lower_bound = np.array([max(color[0] - tolerance, 0), max(color[1] - tolerance, 0), max(color[2] - tolerance, 0)])
    upper_bound = np.array([min(color[0] + tolerance, 179), min(color[1] + tolerance, 255), min(color[2] + tolerance, 255)])
    mask = cv2.inRange(image, lower_bound, upper_bound)
    
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    return mask

if __name__ == "__main__":
    image_path = sys.argv[1]
    markers = json.loads(sys.argv[2])
    result_path = process_image(image_path, markers)
    print(result_path)
