from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64

app = Flask(__name__)

@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        data = request.json
        encoded_image = data['image']
        
        # 解码图像
        decoded_image = base64.b64decode(encoded_image)
        np_img = np.frombuffer(decoded_image, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        
        # 转换为 HSV 色彩空间
        hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # 定义颜色范围
        lower_blue = np.array([110, 50, 50])
        upper_blue = np.array([130, 255, 255])
        lower_red = np.array([0, 100, 100])
        upper_red = np.array([20, 255, 255])
        
        # 过滤蓝色框线
        blue_mask = cv2.inRange(hsv_img, lower_blue, upper_blue)
        blue_edges = cv2.bitwise_and(img, img, mask=blue_mask)
        
        # 过滤红色岩点
        red_mask = cv2.inRange(hsv_img, lower_red, upper_red)
        red_points = cv2.bitwise_and(img, img, mask=red_mask)
        
        # 创建透明背景图像
        transparent_img = np.zeros((img.shape[0], img.shape[1], 4), dtype=np.uint8)
        
        # 将红色岩点和蓝色框线添加到透明背景图像
        transparent_img[:, :, :3] = cv2.add(blue_edges, red_points)
        transparent_img[:, :, 3] = cv2.bitwise_or(blue_mask, red_mask)
        
        # 将透明背景图像叠加到原始图像上
        overlay = cv2.addWeighted(img, 0.7, transparent_img[:, :, :3], 0.3, 0)
        
        # 将处理后的图像转换为 base64 字符串
        _, encoded_processed_image = cv2.imencode('.png', overlay)
        processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')

        return jsonify({'image': processed_image})
    except Exception as e:
        print("Error processing image:", e)
        return jsonify({'error': 'Error processing image'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
