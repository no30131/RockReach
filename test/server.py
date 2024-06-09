from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64

app = Flask(__name__)

def get_color_at_point(image, point):
    b, g, r = image[point[1], point[0]]
    return r, g, b

def create_mask_from_color(image, color, tolerance=30):
    lower_bound = np.array([color[0] - tolerance, color[1] - tolerance, color[2] - tolerance])
    upper_bound = np.array([color[0] + tolerance, color[1] + tolerance, color[2] + tolerance])
    mask = cv2.inRange(image, lower_bound, upper_bound)
    return mask

def find_closest_contour(contours, point):
    min_dist = float('inf')
    closest_contour = None
    for contour in contours:
        dist = cv2.pointPolygonTest(contour, point, True)
        if dist >= 0 and dist < min_dist:
            min_dist = dist
            closest_contour = contour
    return closest_contour

@app.route('/process_selection', methods=['POST'])
def process_selection():
    try:
        data = request.json
        points = data['points']

        # 加载初始图片
        img = cv2.imread('uploads/temp.png')
        if img is None:
            return jsonify({'error': 'Image not found'}), 404

        for point in points:
            x, y = int(point['x']), int(point['y'])
            color = get_color_at_point(img, (x, y))
            mask = create_mask_from_color(img, color)

            # 查找轮廓
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            closest_contour = find_closest_contour(contours, (x, y))

            if closest_contour is not None:
                cv2.drawContours(img, [closest_contour], -1, (0, 255, 0), 3)

        _, encoded_selected_image = cv2.imencode('.png', img)
        selected_image = base64.b64encode(encoded_selected_image).decode('utf-8')

        filename = 'selected_objects.png'
        cv2.imwrite(f'uploads/{filename}', img)
        
        return jsonify({'image': selected_image, 'filename': filename})
    except Exception as e:
        print("Error processing selection:", e)
        return jsonify({'error': 'Error processing selection'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
