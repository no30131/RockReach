from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import os

app = Flask(__name__)

def process_image_by_color(img, color):
    color_ranges = {
        'red': ([0, 50, 50], [10, 255, 255]),
        'orange': ([10, 50, 50], [20, 255, 255]),
        'yellow': ([20, 50, 50], [35, 255, 255]),
        'green': ([35, 50, 50], [90, 255, 255]),
        'blue': ([90, 50, 50], [140, 255, 255]),
        'purple': ([140, 50, 50], [170, 255, 255]),
        'black': ([0, 0, 0], [180, 255, 30]),
    }

    if color not in color_ranges:
        return None, None

    lower_color, upper_color = color_ranges[color]
    lower_color = np.array(lower_color)
    upper_color = np.array(upper_color)
    hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    color_mask = cv2.inRange(hsv_img, lower_color, upper_color)
    color_points = cv2.bitwise_and(img, img, mask=color_mask)
    contours, _ = cv2.findContours(color_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(color_points, contours, -1, (255, 0, 0), thickness=2)
    transparent_img = np.zeros((img.shape[0], img.shape[1], 4), dtype=np.uint8)
    transparent_img[:, :, :3] = color_points
    transparent_img[:, :, 3] = cv2.bitwise_or(color_mask, color_mask)
    overlay = cv2.addWeighted(img, 0.75, transparent_img[:, :, :3], 0.5, 0)
    _, encoded_processed_image = cv2.imencode('.png', overlay)
    processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')
    filename = f'{color}_result.png'
    cv2.imwrite(os.path.join('uploads', filename), overlay)
    return processed_image, filename

@app.route('/select_rock_point', methods=['POST'])
def select_rock_point():
    try:
        data = request.json
        color = data['color']
        encoded_image = data['image']
        decoded_image = base64.b64decode(encoded_image)
        np_img = np.frombuffer(decoded_image, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        processed_image, filename = process_image_by_color(img, color)
        if processed_image is None:
            return jsonify({'error': 'Invalid color selected'}), 400
        return jsonify({'image': processed_image, 'filename': filename})
    except Exception as e:
        print("Error processing image:", e)
        return jsonify({'error': 'Error processing image'})

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(host='0.0.0.0', port=5000)
