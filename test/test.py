# # import cv2
# # import numpy as np
# # from matplotlib import pyplot as plt

# # # 读取彩色图像
# # img = cv2.imread('temp.png')

# # # 边缘检测
# # edges = cv2.Canny(img, 100, 200)

# # # 轮廓检测
# # contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# # # 在原始图像上绘制轮廓
# # cv2.drawContours(img, contours, -1, (0, 255, 0), 2)

# # # 显示图像
# # plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))  # 需要将颜色通道从 BGR 转换为 RGB
# # plt.title('Image')
# # plt.axis('off')  # 不显示坐标轴
# # plt.show()

# # import cv2
# # import numpy as np
# # from matplotlib import pyplot as plt

# # # 读取图像
# # img = cv2.imread('temp.png')

# # # 使用 K-means 聚类算法进行颜色分割
# # data = img.reshape((-1, 3)).astype(np.float32)
# # criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
# # _, labels, centers = cv2.kmeans(data, 5, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

# # # 将每个像素点标记为其所属的颜色类别
# # labels = labels.reshape(img.shape[:2])

# # # 针对每个颜色类别进行边缘检测和轮廓检测
# # for i in range(centers.shape[0]):
# #     mask = np.uint8(labels == i)
# #     edges = cv2.Canny(mask, 100, 200)
# #     contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
# #     cv2.drawContours(img, contours, -1, (0, 255, 0), 2)


# import cv2 as cv
# import numpy as np
# from matplotlib import pyplot as plt

# cap = cv.VideoCapture(0)

# while(1):
#     # Take each frame
#     _, frame = cap.read()
#     # Convert BGR to HSV
#     hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
#     # define range of blue color in HSV
#     lower_blue = np.array([110,50,50])
#     upper_blue = np.array([130,255,255])
#     # Threshold the HSV image to get only blue colors
#     mask = cv.inRange(hsv, lower_blue, upper_blue)
#     # Bitwise-AND mask and original image
#     res = cv.bitwise_and(frame,frame, mask= mask)
#     cv.imshow('frame',frame)
#     cv.imshow('mask',mask)
#     cv.imshow('res',res)
#     k = cv.waitKey(5) & 0xFF
#     if k == 27:
#     break

# cv.destroyAllWindows()

# # 显示结果
# plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB))
# plt.title('Contours')
# plt.axis('off')
# plt.show()


# import cv2
# import numpy as np

# # 讀取圖像
# image = cv2.imread('temp.png')

# # 將圖像轉換為HSV色彩空間
# hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

# # 將圖像轉換為一維數組
# hsv_flat = hsv_image.reshape((-1, 3))

# # 列出所有顏色
# unique_colors, counts = np.unique(hsv_flat, axis=0, return_counts=True)

# # 打印結果
# for color, count in zip(unique_colors, counts):
#     print(f"Color: {color}, Count: {count}")


# import cv2
# import numpy as np

# def count_unique_colors(image):
#     # 將圖像轉換為 HSV 色彩空間
#     hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
#     # 將圖像轉換為一維數組
#     hsv_flat = hsv_image.reshape((-1, 3)).astype(np.float32)
    
#     # 設定 k-means 參數
#     criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
#     k = 8  # 假設有8種顏色
#     attempts = 10
#     flags = cv2.KMEANS_RANDOM_CENTERS
    
#     # 執行 k-means 聚類
#     _, labels, centers = cv2.kmeans(hsv_flat, k, None, criteria, attempts, flags)
    
#     # 計算每個顏色的數量
#     unique_labels, counts = np.unique(labels, return_counts=True)
    
#     # 返回色彩集群的數量
#     return len(unique_labels)

# # 讀取圖像
# image = cv2.imread('temp.png')

# # 計算不同顏色的攀岩路線數量
# num_colors = count_unique_colors(image)

# print(f"Number of climbing routes: {num_colors}")


# import cv2
# import numpy as np

# def find_main_colors(image):
#     # 將圖像轉換為 HSV 色彩空間
#     hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
#     # 將圖像轉換為一維數組
#     hsv_flat = hsv_image.reshape((-1, 3)).astype(np.float32)
    
#     # 設定 k-means 參數
#     criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
#     k = 8  # 假設有8種主要顏色
#     attempts = 10
#     flags = cv2.KMEANS_RANDOM_CENTERS
    
#     # 初始化主要顏色列表
#     main_colors = []
    
#     # 初始化顏色範圍列表
#     color_ranges = []
    
#     # 計算每條路線的主要顏色和顏色範圍
#     for route in range(1, 9):  # 假設有8條攀岩路線
#         # 提取每條路線的 ROI
#         # 這裡需要根據你的程式碼中如何定義路線的 ROI 進行提取
        
#         # 執行 k-means 聚類
#         _, labels, centers = cv2.kmeans(hsv_flat, k, None, criteria, attempts, flags)
        
#         # 計算每個顏色的數量
#         unique_labels, counts = np.unique(labels, return_counts=True)
        
#         # 找到主要顏色的索引
#         main_color_index = np.argmax(counts)
#         main_color_h, main_color_s, main_color_v = centers[main_color_index]
        
#         # 將主要顏色轉換為 BGR 格式
#         main_color_rgb = cv2.cvtColor(np.uint8([[main_color_h, main_color_s, main_color_v]]), cv2.COLOR_HSV2BGR_FULL)[0][0]
        
#         # 找到顏色範圍的上界和下界
#         lower_color = np.array([main_color_h - 10, main_color_s - 30, main_color_v - 30])
#         upper_color = np.array([main_color_h + 10, main_color_s + 30, main_color_v + 30])
        
#         # 將主要顏色和顏色範圍添加到列表中
#         main_colors.append(main_color_rgb)
#         color_ranges.append((lower_color, upper_color))
    
#     return main_colors, color_ranges

# # 讀取圖像
# image = cv2.imread('temp.png')

# # 計算每條路線的主要顏色和顏色範圍
# main_colors, color_ranges = find_main_colors(image)

# # 輸出每條路線的主要顏色和顏色範圍
# for i in range(len(main_colors)):
#     print(f"Route {i+1} main color (BGR): {main_colors[i]}")
#     print(f"Route {i+1} color range (lower, upper): {color_ranges[i]}")


# import cv2
# import numpy as np

# def find_major_colors(image_path, num_colors):
#     # 读取图像并转换为 RGB 颜色空间
#     img = cv2.imread(image_path)
#     img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

#     # 将图像重塑为像素点的列表
#     pixels = img.reshape((-1, 3))
    
#     # 使用 K-Means 聚类算法将像素分成 num_colors 个颜色簇
#     criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, 0.1)
#     _, labels, centers = cv2.kmeans(pixels.astype(np.float32), num_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

#     # 统计每个颜色簇的像素数量
#     counts = np.bincount(labels.flatten())

#     # 计算总像素数量
#     total_pixels = np.sum(counts)

#     # 计算每个颜色簇的占比
#     percentages = counts / total_pixels

#     # 过滤掉占比较小的颜色簇
#     threshold = 0.01  # 1% 的占比
#     major_colors = centers[percentages > threshold]

#     return major_colors

# # 示例用法
# image_path = 'temp.png'  # 将 'your_image.jpg' 替换为你的图片路径
# num_colors = 5
# major_colors = find_major_colors(image_path, num_colors)
# print("Major colors found:", len(major_colors))
# print("Major colors:")
# for color in major_colors:
#     print(color)


### 找出圖內主要的5種顏色
# import cv2
# import numpy as np
# import matplotlib.pyplot as plt

# def find_major_colors(image_path, num_colors):
#     # 读取图像并转换为 RGB 颜色空间
#     img = cv2.imread(image_path)
#     img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

#     # 将图像重塑为像素点的列表
#     pixels = img.reshape((-1, 3))
    
#     # 使用 K-Means 聚类算法将像素分成 num_colors 个颜色簇
#     criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, 0.1)
#     _, labels, centers = cv2.kmeans(pixels.astype(np.float32), num_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

#     # 统计每个颜色簇的像素数量
#     counts = np.bincount(labels.flatten())

#     # 计算总像素数量
#     total_pixels = np.sum(counts)

#     # 计算每个颜色簇的占比
#     percentages = counts / total_pixels

#     # 过滤掉占比较小的颜色簇
#     threshold = 0.01  # 1% 的占比
#     major_colors = centers[percentages > threshold]

#     return major_colors

# # 示例用法
# image_path = 'temp.png'  # 将 'your_image.jpg' 替换为你的图片路径
# num_colors = 5
# major_colors = find_major_colors(image_path, num_colors)
# print("Major colors found:", len(major_colors))
# print("Major colors:")
# for color in major_colors:
#     print(color)

# # 绘制颜色示例
# plt.figure(figsize=(8, 6))
# for color in major_colors:
#     color_patch = np.full((10, 10, 3), color, dtype=np.uint8)
#     plt.imshow(color_patch)
#     plt.axis('off')
#     plt.show()




# import cv2
# import numpy as np
# import matplotlib.pyplot as plt

# def find_routes(image_path, num_colors):
#     # 读取图像并转换为 RGB 颜色空间
#     img = cv2.imread(image_path)
#     img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

#     # 预处理图像，例如调整大小
#     # 这里简单地将图像缩小为原来的一半
#     img = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)

#     # 将图像重塑为像素点的列表
#     pixels = img.reshape((-1, 3))
    
#     # 使用 K-Means 聚类算法将像素分成 num_colors 个颜色簇
#     criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, 0.1)
#     _, labels, centers = cv2.kmeans(pixels.astype(np.float32), num_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

#     # 根据聚类结果将岩点分组成路线
#     routes = [[] for _ in range(num_colors)]
#     height, width = img.shape[:2]
#     for i in range(height):
#         for j in range(width):
#             color_label = labels[i * width + j]
#             color_label = int(color_label)  # 确保 color_label 是整数类型
#             routes[color_label].append((i, j))

#     return routes

# def visualize_routes(image_path, routes):
#     # 读取原始图像
#     img = cv2.imread(image_path)
#     img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

#     # 可视化路线
#     for color, route in enumerate(routes):
#         for pixel in route:
#             img[pixel[0], pixel[1]] = np.array([255, 255, 255])  # 将路线上的像素设为白色

#     # 显示图像
#     plt.imshow(img)
#     plt.axis('off')
#     plt.show()

# # 示例用法
# image_path = 'temp.png'  # 将 'your_image.jpg' 替换为你的图片路径
# num_colors = 10  # 假设有 10 种不同的岩点颜色
# routes = find_routes(image_path, num_colors)
# visualize_routes(image_path, routes)


# import cv2
# import numpy as np

# def find_dominant_colors(image_path):
#     # 讀取圖像
#     image = cv2.imread(image_path)
    
#     # 轉換為HSV空間
#     hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
#     # 定義顏色範圍（你可以根據需要調整這些範圍）
#     color_ranges = [
#         ((0, 50, 50), (20, 255, 255)),  # 紅色
#         ((110, 50, 50), (130, 255, 255)),  # 橙色
#         ((30, 100, 50), (80, 255, 150)),  # 黃色
#         ((10, 100, 100), (40, 255, 255)),  # 綠色
#         ((60, 100, 50), (90, 255, 150))   # 青色
#     ]
    
#     # 初始化顏色頻率字典
#     color_freq = {}
    
#     # 遍歷每個像素
#     for y in range(hsv_image.shape[0]):
#         for x in range(hsv_image.shape[1]):
#             pixel = hsv_image[y, x]
            
#             # 檢查每個顏色範圍
#             for lower_bound, upper_bound in color_ranges:
#                 if lower_bound[0] <= pixel[0] <= upper_bound[0] and \
#                    lower_bound[1] <= pixel[1] <= upper_bound[1] and \
#                    lower_bound[2] <= pixel[2] <= upper_bound[2]:
#                     # 如果匹配，增加該顏色的頻率
#                     color_name = "red"  # 這裡假設所有匹配到的顏色都是紅色
#                     if color_name in color_freq:
#                         color_freq[color_name] += 1
#                     else:
#                         color_freq[color_name] = 1
    
#     # 找到最常見的顏色
#     dominant_color = max(color_freq, key=color_freq.get)
    
#     return dominant_color

# # 使用函數
# dominant_color = find_dominant_colors('temp.png')
# print(f'主導顏色：{dominant_color}')


# from PIL import Image, ImageStat

# def find_main_colors(image_path):
#     try:
#         # 打開圖像
#         img = Image.open(image_path)
        
#         # 檢查圖像是否為None
#         if img is None:
#             raise ValueError("無法開啟指定的圖像文件。請檢查檔案路徑和檔案名稱是否正確。")
        
#         # 計算圖像的顏色統計信息
#         stat = ImageStat.Stat(img)
        
#         # 獲取平均顏色
#         avg_color = stat.mean
        
#         # 返回平均顏色
#         return [(sum(avg_color), tuple(int(round(c)) for c in avg_color))]
#     except Exception as e:
#         print(f"錯誤發生：{e}")
#         return []

# # 使用函數
# image_path = 'temp.png'
# main_colors = find_main_colors(image_path)

# if main_colors:
#     print("主要顏色:")
#     for color_count, color_tuple in main_colors:
#         print(f"{color_count}: {color_tuple}")
# else:
#     print("無法獲取主要顏色。請檢查圖像文件和路徑。")



# from PIL import Image

# def find_unique_colors(image_path):
#     # 打開圖像
#     img = Image.open(image_path)
    
#     # 確保圖像是RGB模式
#     img_rgb = img.convert('RGB')
    
#     # 初始化一個集合來存儲唯一的顏色
#     unique_colors = set()
    
#     # 遍歷圖像中的每個像素
#     for x in range(img_rgb.width):
#         for y in range(img_rgb.height):
#             pixel = img_rgb.getpixel((x, y))
#             unique_colors.add(pixel)
    
#     # 返回唯一的顏色數量
#     return len(unique_colors)

# # 使用函數
# image_path = 'temp.png'
# unique_color_count = find_unique_colors(image_path)

# print(f"圖像中獨特的顏色數量：{unique_color_count}")


# ## 先列出可能有的顏色範圍，然後每張圖判斷
# from PIL import Image

# # 定義顏色類別和範圍
# color_categories = {
#     "紅色": {"min": (200, 0, 0), "max": (255, 64, 64)},
#     "藍色": {"min": (64, 0, 192), "max": (192, 64, 255)},
#     "黃色": {"min": (192, 192, 0), "max": (255, 255, 64)},
#     "綠色": {"min": (0, 192, 0), "max": (128, 255, 128)},
#     "黑色": {"min": (0, 0, 0), "max": (64, 64, 64)},
#     "橘色": {"min": (192, 64, 0), "max": (255, 128, 0)}
# }

# def find_major_colors(image_path):
#     # 打開圖像
#     img = Image.open(image_path)
    
#     # 確保圖像是RGB模式
#     img_rgb = img.convert('RGB')
    
#     # 初始化一個字典來存儲每種顏色類別的出現次數
#     color_counts = {}
    
#     # 遍歷圖像中的每個像素
#     for x in range(img_rgb.width):
#         for y in range(img_rgb.height):
#             pixel = img_rgb.getpixel((x, y))
            
#             # 將像素顏色分類到相應的顏色類別
#             for category, range_ in color_categories.items():
#                 if range_["min"] <= pixel <= range_["max"]:
#                     if category in color_counts:
#                         color_counts[category] += 1
#                     else:
#                         color_counts[category] = 1
    
#     # 將字典按照出現次數排序
#     sorted_colors = sorted(color_counts.items(), key=lambda item: item[1], reverse=True)
    
#     # 返回前N個主要顏色類別（N可以根據需要調整）
#     major_colors = [name for name, count in sorted_colors[:5]]
    
#     return major_colors

# # 使用函數
# image_path = 'temp.png'
# major_colors = find_major_colors(image_path)

# print("主要顏色類別:")
# for color in major_colors:
#     print(color)



# import cv2
# import numpy as np

# # 定義顏色類別和範圍（範圍應根據需要調整）
# color_categories = {
#     "紅色": {"min": (0, 0, 200), "max": (64, 64, 255)},
#     "藍色": {"min": (192, 0, 64), "max": (255, 64, 192)},
#     "黃色": {"min": (0, 192, 192), "max": (64, 255, 255)},
#     "綠色": {"min": (0, 192, 0), "max": (128, 255, 128)},
#     "黑色": {"min": (0, 0, 0), "max": (64, 64, 64)},
#     "橘色": {"min": (0, 64, 192), "max": (0, 128, 255)}
# }

# def find_major_colors(image_path):
#     # 讀取圖像
#     img = cv2.imread(image_path)
    
#     # 檢查圖像是否正確讀取
#     if img is None:
#         raise ValueError(f"Image at path '{image_path}' could not be read.")
    
#     # 確保圖像是RGB模式
#     img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
#     # 初始化一個字典來存儲每種顏色類別的出現次數
#     color_counts = {category: 0 for category in color_categories}
    
#     # 遍歷顏色類別進行顏色篩選
#     for category, range_ in color_categories.items():
#         # 創建遮罩
#         mask = cv2.inRange(img_rgb, np.array(range_["min"]), np.array(range_["max"]))
        
#         # 計算顏色範圍內的像素數
#         color_counts[category] = cv2.countNonZero(mask)
    
#     # 將字典按照出現次數排序
#     sorted_colors = sorted(color_counts.items(), key=lambda item: item[1], reverse=True)
    
#     # 返回前N個主要顏色類別（N可以根據需要調整）
#     major_colors = [name for name, count in sorted_colors[:10]]
    
#     return major_colors

# # 使用函數
# image_path = 'temp.png'
# major_colors = find_major_colors(image_path)

# print("主要顏色類別:")
# for color in major_colors:
#     print(color)


import cv2
import numpy as np

# 讀取圖像
image_path = 'temp.png'
img = cv2.imread(image_path)

# 定義HSV顏色範圍
colors = [
    ((0, 50, 80), (10, 255, 255)),  # 顏色範圍1
    ((10, 50, 60), (35, 255, 255)),  # 顏色範圍2
    ((40, 50, 50), (90, 255, 255)),  # 顏色範圍3
    ((140, 50, 50), (170, 255, 255)),  # 顏色範圍4
    ((0, 0, 200), (180, 55, 255))   # 顏色範圍5
]

for i, (lower, upper) in enumerate(colors):
    # 轉換顏色空間
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # 創建掩模
    mask = cv2.inRange(hsv, lower, upper)
    
    # 應用掩模
    result = cv2.bitwise_and(img, img, mask=mask)
    
    # 保存結果
    output_path = f'result_{i+1}.jpg'
    cv2.imwrite(output_path, result)
    print(f'Saved {output_path}')
