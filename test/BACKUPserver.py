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
        
#         # 解碼圖片
#         decoded_image = base64.b64decode(encoded_image)
#         np_img = np.frombuffer(decoded_image, np.uint8)
#         img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        
#         # 將 RGBA 轉換為 RGB
#         img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
        
#         # # 創建輸出矩陣
#         # dst = np.zeros_like(img)
        
#         # # 設定結構元素大小
#         # ksize = (5, 5)
        
#         # # 創建結構元素
#         # M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
        
#         # 進行形態學梯度運算
#         ksize = (5, 5)
#         M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
#         dst = cv2.morphologyEx(img, cv2.MORPH_GRADIENT, M)
#         # cv2.morphologyEx(img, cv2.MORPH_GRADIENT, M, dst)
        
#         # # 根據特定顏色過濾岩點
#         # color_to_filter = (134, 130, 117) 
#         # mask = cv2.inRange(dst, color_to_filter, color_to_filter)  # 生成遮罩
#         # filtered_points = cv2.bitwise_and(img, img, mask=mask)  # 過濾岩點
         
#         # 將處理後的圖片轉換為 base64 字符串
#         # _, encoded_processed_image = cv2.imencode('.jpg', filtered_points)
#         _, encoded_processed_image = cv2.imencode('.jpg', dst)
#         processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')

#         return jsonify({'image': processed_image})
#     except Exception as e:
#         print("Error processing image:", e)
#         return jsonify({'error': 'Error processing image'})

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)


# ## 純色塊 有黑底 無邊線
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
        
#         # 将 RGBA 转换为 RGB
#         img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
        
#         # 将图像转换为 HSV 色彩空间
#         hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)

#         # 定义要过滤的颜色范围（这里以蓝色为例）
#         lower_blue = np.array([110,50,50])
#         upper_blue = np.array([130,255,255])

#         # 使用掩码进行颜色过滤
#         mask = cv2.inRange(hsv, lower_blue, upper_blue)

#         # 使用掩码过滤图像
#         filtered_img = cv2.bitwise_and(img, img, mask=mask)

#         # 将处理后的图像转换为 base64 字符串
#         _, encoded_processed_image = cv2.imencode('.jpg', filtered_img)
#         processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')

#         return jsonify({'image': processed_image})
#     except Exception as e:
#         print("Error processing image:", e)
#         return jsonify({'error': 'Error processing image'})

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)


## 
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
        
#         # 转换为 HSV 色彩空间
#         hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
#         # 定义颜色范围
#         lower_blue = np.array([110, 50, 50])
#         upper_blue = np.array([130, 255, 255])
#         lower_red = np.array([0, 100, 100])
#         upper_red = np.array([10, 255, 255])  # 调整红色范围
        
#         # 过滤蓝色框线
#         blue_mask = cv2.inRange(hsv_img, lower_blue, upper_blue)
#         blue_edges = cv2.bitwise_and(img, img, mask=blue_mask)
        
#         # 过滤红色岩点
#         red_mask = cv2.inRange(hsv_img, lower_red, upper_red)
#         red_points = cv2.bitwise_and(img, img, mask=red_mask)
        
#         # 创建透明背景图像
#         transparent_img = np.zeros((img.shape[0], img.shape[1], 4), dtype=np.uint8)
        
#         # 将红色岩点和蓝色框线添加到透明背景图像
#         transparent_img[:, :, :3] = cv2.add(blue_edges, red_points)
#         transparent_img[:, :, 3] = cv2.bitwise_or(blue_mask, red_mask)
        
#         # 保持蓝色轮廓线
#         final_img = img.copy()
#         final_img[blue_mask > 0] = blue_edges[blue_mask > 0]
        
#         # 将红色岩点叠加到原始图像上
#         for i in range(3):
#             final_img[:, :, i] = np.where(red_mask > 0, red_points[:, :, i], final_img[:, :, i])
        
#         # 将处理后的图像转换为 base64 字符串
#         _, encoded_processed_image = cv2.imencode('.png', final_img)
#         processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')

#         return jsonify({'image': processed_image})
#     except Exception as e:
#         print("Error processing image:", e)
#         return jsonify({'error': 'Error processing image'})

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)


## 無黑底 透明壓黑 有邊框
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
        
        # 進行形態學梯度運算
        ksize = (5, 5)
        M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
        dst = cv2.morphologyEx(hsv_img, cv2.MORPH_GRADIENT, M)
        
        # 定义颜色范围
        lower_color = np.array([40, 50, 50])
        upper_color = np.array([90, 255, 255])
        
        # 过滤岩点
        color_mask = cv2.inRange(hsv_img, lower_color, upper_color)
        color_points = cv2.bitwise_and(img, img, mask=color_mask)
        
        # 在透明背景图像上繪製描邊框線
        contours, _ = cv2.findContours(color_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(color_points, contours, -1, (255, 0, 0), thickness=2)
        
        # 创建透明背景图像
        transparent_img = np.zeros((dst.shape[0], dst.shape[1], 4), dtype=np.uint8)
        
        # 将岩点和框线添加到透明背景图像
        transparent_img[:, :, :3] = color_points
        transparent_img[:, :, 3] = cv2.bitwise_or(color_mask, color_mask)
        
        # 将透明背景图像叠加到原始图像上
        overlay = cv2.addWeighted(img, 0.75, transparent_img[:, :, :3], 0.5, 0)
        
        # 将处理后的图像转换为 base64 字符串
        _, encoded_processed_image = cv2.imencode('.png', overlay)
        processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')

        return jsonify({'image': processed_image})
    except Exception as e:
        print("Error processing image:", e)
        return jsonify({'error': 'Error processing image'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
