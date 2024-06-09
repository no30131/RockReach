# from flask import Flask, request, jsonify
# import cv2
# import numpy as np
# import base64

# app = Flask(__name__)

# @app.route('/process_image', methods=['POST'])
# def process_image():
#     try:
#         data = request.json
#         encoded_image = data['image']
        
#         # 解码图像
#         decoded_image = base64.b64decode(encoded_image)
#         np_img = np.frombuffer(decoded_image, np.uint8)
#         img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        
#         # 保存原始圖像以供後續使用
#         cv2.imwrite('original_image.png', img)

#         # 转换为 HSV 色彩空间
#         hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
#         # # 進行形態學梯度運算
#         # ksize = (5, 5)
#         # M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
#         # dst = cv2.morphologyEx(hsv_img, cv2.MORPH_GRADIENT, M)
        
#         # 定义颜色范围
#         lower_color = np.array([40, 50, 50])
#         upper_color = np.array([90, 255, 255])
        
#         # 过滤岩点
#         color_mask = cv2.inRange(hsv_img, lower_color, upper_color)
#         color_points = cv2.bitwise_and(img, img, mask=color_mask)
        
#         # 在透明背景图像上繪製描邊框線
#         contours, _ = cv2.findContours(color_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#         cv2.drawContours(color_points, contours, -1, (255, 0, 0), thickness=2)
        
#         # 创建透明背景图像
#         # transparent_img = np.zeros((dst.shape[0], dst.shape[1], 4), dtype=np.uint8)
#         transparent_img = np.zeros((img.shape[0], img.shape[1], 4), dtype=np.uint8)

#         # 将岩点和框线添加到透明背景图像
#         transparent_img[:, :, :3] = color_points
#         transparent_img[:, :, 3] = cv2.bitwise_or(color_mask, color_mask)
        
#         # 将透明背景图像叠加到原始图像上
#         overlay = cv2.addWeighted(img, 0.75, transparent_img[:, :, :3], 0.5, 0)
        
#         # 将处理后的图像转换为 base64 字符串
#         _, encoded_processed_image = cv2.imencode('.png', overlay)
#         processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')

#         return jsonify({'image': processed_image})
#     except Exception as e:
#         print("Error processing image:", e)
#         return jsonify({'error': 'Error processing image'})

# @app.route('/select_rock_point', methods=['POST'])
# def select_rock_point():
#     try:
#         data = request.json
#         color = data['color']
        
#         # 定義顏色範圍，這裡需要你之前提供的顏色範圍
#         color_ranges = {
#             'red': ([0, 100, 100], [20, 255, 255]),
#             'blue': ([64, 0, 192], [192, 64, 255]),
#             'yellow': ([192, 192, 0], [255, 255, 64]),
#             'green': ([0, 192, 0], [128, 255, 128]),
#             'black': ([0, 0, 0], [64, 64, 64]),
#             'orange': ([192, 64, 0], [255, 128, 0]),
#             'purple': ([128, 0, 128], [192, 64, 192]),
#             'bright_orange': ([255, 165, 0], [255, 200, 0]),
#             'dark_green': ([0, 100, 0], [0, 128, 0]),
#             'beige': ([245, 245, 220], [255, 255, 240])
#         }
        
#         if color not in color_ranges:
#             return jsonify({'error': 'Invalid color selected'}), 400

#         lower_color, upper_color = color_ranges[color]
#         lower_color = np.array(lower_color)
#         upper_color = np.array(upper_color)
        
#         # 讀取原始圖像
#         img = cv2.imread('original_image.png')
#         hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
#         # 過濾指定顏色的岩點
#         color_mask = cv2.inRange(hsv_img, lower_color, upper_color)
#         color_points = cv2.bitwise_and(img, img, mask=color_mask)
        
#         # 在透明背景圖像上繪製描邊框線
#         contours, _ = cv2.findContours(color_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#         cv2.drawContours(color_points, contours, -1, (255, 0, 0), thickness=2)
        
#         # 創建透明背景圖像
#         transparent_img = np.zeros((img.shape[0], img.shape[1], 4), dtype=np.uint8)
        
#         # 將岩點和框線添加到透明背景圖像
#         transparent_img[:, :, :3] = color_points
#         transparent_img[:, :, 3] = cv2.bitwise_or(color_mask, color_mask)
        
#         # 將透明背景圖像疊加到原始圖像上
#         overlay = cv2.addWeighted(img, 0.75, transparent_img[:, :, :3], 0.5, 0)
        
#         # 將處理後的圖像轉換為base64字符串
#         _, encoded_processed_image = cv2.imencode('.png', overlay)
#         processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')
        
#         return jsonify({'image': processed_image})
#     except Exception as e:
#         print("Error selecting rock point:", e)
#         return jsonify({'error': 'Error selecting rock point'})

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)


from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import os

app = Flask(__name__)

@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        data = request.json
        encoded_image = data['image']
        
        # 解碼圖像
        decoded_image = base64.b64decode(encoded_image)
        np_img = np.frombuffer(decoded_image, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        
        # 保存原始圖像以供後續使用
        cv2.imwrite('original_image.png', img)

        # 將圖像轉換為HSV色彩空間
        hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # 定義顏色範圍
        lower_color = np.array([40, 50, 50])
        upper_color = np.array([90, 255, 255])

        # 過濾岩點
        color_mask = cv2.inRange(hsv_img, lower_color, upper_color)
        color_points = cv2.bitwise_and(img, img, mask=color_mask)

        # 在透明背景圖像上繪製描邊框線
        contours, _ = cv2.findContours(color_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(color_points, contours, -1, (255, 0, 0), thickness=2)

        # 創建透明背景圖像
        transparent_img = np.zeros((img.shape[0], img.shape[1], 4), dtype=np.uint8)

        # 將岩點和框線添加到透明背景圖像
        transparent_img[:, :, :3] = color_points
        transparent_img[:, :, 3] = cv2.bitwise_or(color_mask, color_mask)

        # 將透明背景圖像疊加到原始圖像上
        overlay = cv2.addWeighted(img, 0.75, transparent_img[:, :, :3], 0.5, 0)

        # 將處理後的圖像轉換為base64字符串
        _, encoded_processed_image = cv2.imencode('.png', overlay)
        processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')

        return jsonify({'image': processed_image})
    except Exception as e:
        print("Error processing image:", e)
        return jsonify({'error': 'Error processing image'})


@app.route('/select_rock_point', methods=['POST'])
def select_rock_point():
    try:
        data = request.json
        color = data['color']
        
        # 定義顏色範圍，這裡需要你之前提供的顏色範圍
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
            return jsonify({'error': 'Invalid color selected'}), 400

        lower_color, upper_color = color_ranges[color]
        lower_color = np.array(lower_color)
        upper_color = np.array(upper_color)
        
        # 讀取原始圖像
        img = cv2.imread('original_image.png')
        hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # 過濾指定顏色的岩點
        color_mask = cv2.inRange(hsv_img, lower_color, upper_color)
        color_points = cv2.bitwise_and(img, img, mask=color_mask)
        
        # 在透明背景圖像上繪製描邊框線
        contours, _ = cv2.findContours(color_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(color_points, contours, -1, (255, 0, 0), thickness=2)
        
        # 創建透明背景圖像
        transparent_img = np.zeros((img.shape[0], img.shape[1], 4), dtype=np.uint8)
        
        # 將岩點和框線添加到透明背景圖像
        transparent_img[:, :, :3] = color_points
        transparent_img[:, :, 3] = cv2.bitwise_or(color_mask, color_mask)
        
        # 將透明背景圖像疊加到原始圖像上
        overlay = cv2.addWeighted(img, 0.75, transparent_img[:, :, :3], 0.5, 0)
        
        # 將處理後的圖像轉換為base64字符串
        _, encoded_processed_image = cv2.imencode('.png', overlay)
        processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')

        # 保存處理後的圖像
        filename = f'{color}_result.png'
        cv2.imwrite(filename, overlay)
        
        return jsonify({'image': processed_image, 'filename': filename})
        # return jsonify({'image': processed_image})
    except Exception as e:
        print("Error processing image:", e)
        return jsonify({'error': 'Error processing image'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)