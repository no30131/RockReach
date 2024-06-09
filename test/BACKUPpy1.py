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
        
        # 解碼圖片
        decoded_image = base64.b64decode(encoded_image)
        np_img = np.frombuffer(decoded_image, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        
        # 將 RGBA 轉換為 RGB
        img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
        
        # # 創建輸出矩陣
        # dst = np.zeros_like(img)
        
        # # 設定結構元素大小
        # ksize = (5, 5)
        
        # # 創建結構元素
        # M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
        
        # 進行形態學梯度運算
        ksize = (5, 5)
        M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
        dst = cv2.morphologyEx(img, cv2.MORPH_GRADIENT, M)
        # cv2.morphologyEx(img, cv2.MORPH_GRADIENT, M, dst)
        
        # # 根據特定顏色過濾岩點
        # color_to_filter = (134, 130, 117) 
        # mask = cv2.inRange(dst, color_to_filter, color_to_filter)  # 生成遮罩
        # filtered_points = cv2.bitwise_and(img, img, mask=mask)  # 過濾岩點
         
        # 將處理後的圖片轉換為 base64 字符串
        # _, encoded_processed_image = cv2.imencode('.jpg', filtered_points)
        _, encoded_processed_image = cv2.imencode('.jpg', dst)
        processed_image = base64.b64encode(encoded_processed_image).decode('utf-8')

        return jsonify({'image': processed_image})
    except Exception as e:
        print("Error processing image:", e)
        return jsonify({'error': 'Error processing image'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
