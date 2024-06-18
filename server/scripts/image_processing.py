
import cv2
import numpy as np
import sys
import json

def find_closest_contour(contours, point):
    min_dist = float('inf')
    closest_contour = None
    for contour in contours:
        dist = cv2.pointPolygonTest(contour, point, True)
        if dist >= 0 and dist < min_dist:
            min_dist = dist
            closest_contour = contour
    return closest_contour

def process_image(image_path, markers):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError('Image not found')

    # Convert image to HSV
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    output = image.copy()

    for marker in markers:
        x, y = int(marker['x']), int(marker['y'])
        color = get_color_at_point(hsv_image, (x, y))
        mask = create_mask_from_color(hsv_image, color, tolerance=77)

        # 調試信息
        print(f"Processing marker at ({x}, {y}) with color {color}", file=sys.stderr)

        # 查找輪廓
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            print(f"No contours found for color {color} at ({x}, {y})", file=sys.stderr)
            continue

        closest_contour = find_closest_contour(contours, (x, y))

        if closest_contour is not None:
            cv2.drawContours(output, [closest_contour], -1, (0, 255, 0), 2)
            print(f"Drew contour for marker at ({x}, {y})", file=sys.stderr)
        else:
            print(f"No closest contour found for marker at ({x}, {y}) with color {color}", file=sys.stderr)

    result_path = 'uploads/output.png'
    cv2.imwrite(result_path, output)
    return result_path

def get_color_at_point(image, point):
    h, s, v = image[point[1], point[0]]
    return h, s, v

def create_mask_from_color(image, color, tolerance=20):
    lower_bound = np.array([max(color[0] - tolerance, 0), max(color[1] - tolerance, 0), max(color[2] - tolerance, 0)])
    upper_bound = np.array([min(color[0] + tolerance, 179), min(color[1] + tolerance, 255), min(color[2] + tolerance, 255)])
    mask = cv2.inRange(image, lower_bound, upper_bound)
    
    # Apply morphological operations to clean up the mask
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    return mask

if __name__ == "__main__":
    image_path = sys.argv[1]
    markers = json.loads(sys.argv[2])
    result_path = process_image(image_path, markers)
    print(result_path)  # 只輸出結果文件的路徑






# import cv2
# import numpy as np
# import sys
# import json

# def find_closest_contour(contours, point):
#     min_dist = float('inf')
#     closest_contour = None
#     for contour in contours:
#         dist = cv2.pointPolygonTest(contour, point, True)
#         if dist >= 0 and dist < min_dist:
#             min_dist = dist
#             closest_contour = contour
#     return closest_contour

# def process_image(image_path, markers):
#     image = cv2.imread(image_path)
#     if image is None:
#         raise ValueError('Image not found')

#     # Apply morphological gradient operation (From JavaScript code)
#     src = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#     dst = np.zeros_like(src)
#     ksize = (5, 5)
#     M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
#     cv2.morphologyEx(src, cv2.MORPH_GRADIENT, M, dst)

#     # Convert the image to grayscale
#     gray_image = cv2.cvtColor(dst, cv2.COLOR_BGR2GRAY)
    
#     # Apply binary thresholding
#     _, binary_image = cv2.threshold(gray_image, 127, 255, cv2.THRESH_BINARY)

#     output = image.copy()

#     for marker in markers:
#         x, y = int(marker['x']), int(marker['y'])
#         color = get_color_at_point(image, (x, y))
#         mask = create_mask_from_color(image, color, tolerance=95)

#         # 調試信息
#         print(f"Processing marker at ({x}, {y}) with color {color}", file=sys.stderr)

#         # 查找輪廓
#         contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#         if not contours:
#             print(f"No contours found for color {color} at ({x}, {y})", file=sys.stderr)
#             continue

#         closest_contour = find_closest_contour(contours, (x, y))

#         if closest_contour is not None:
#             cv2.drawContours(output, [closest_contour], -1, (0, 255, 0), 2)
#         else:
#             print(f"No closest contour found for marker at ({x}, {y}) with color {color}", file=sys.stderr)

#     result_path = 'uploads/output.png'
#     cv2.imwrite(result_path, output)
#     return result_path

# def get_color_at_point(image, point):
#     b, g, r = image[point[1], point[0]]
#     return r, g, b

# def create_mask_from_color(image, color, tolerance=60):
#     lower_bound = np.array([max(color[0] - tolerance, 0), max(color[1] - tolerance, 0), max(color[2] - tolerance, 0)])
#     upper_bound = np.array([min(color[0] + tolerance, 255), min(color[1] + tolerance, 255), min(color[2] + tolerance, 255)])
#     mask = cv2.inRange(image, lower_bound, upper_bound)
    
#     # Convert mask to binary image
#     _, binary_mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
#     return binary_mask

# if __name__ == "__main__":
#     image_path = sys.argv[1]
#     markers = json.loads(sys.argv[2])
#     result_path = process_image(image_path, markers)
#     print(result_path)  # 只輸出結果文件的路徑










# import cv2
# import numpy as np
# import sys
# import json

# def process_image_with_morph_gradient(image_path):
#     image = cv2.imread(image_path)
#     if image is None:
#         raise ValueError('Image not found')

#     # Apply morphological gradient operation (From JavaScript code)
#     src = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#     dst = np.zeros_like(src)
#     ksize = (5, 5)
#     M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
#     cv2.morphologyEx(src, cv2.MORPH_GRADIENT, M, dst)

#     # Convert the result to grayscale for better visualization
#     gray_dst = cv2.cvtColor(dst, cv2.COLOR_BGR2GRAY)
    
#     result_path = 'uploads/morph_gradient_output.png'
#     cv2.imwrite(result_path, gray_dst)
#     return result_path

# if __name__ == "__main__":
#     image_path = sys.argv[1]
#     result_path = process_image_with_morph_gradient(image_path)
#     print(result_path)  # 只输出结果文件的路径




# import cv2
# import numpy as np
# import sys
# import json
# import os

# def process_image_with_markers(image_path, markers):
#     image = cv2.imread(image_path)
#     if image is None:
#         raise ValueError('Image not found')

#     print(f"Image loaded: {image.shape}")

#     # Apply morphological gradient operation
#     src = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#     dst = np.zeros_like(src)
#     ksize = (5, 5)
#     M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
#     gradient = cv2.morphologyEx(src, cv2.MORPH_GRADIENT, M)

#     print("Morphological gradient applied")

#     # Save gradient image for debugging
#     gradient_path = os.path.join(os.path.dirname(image_path), 'gradient_output.png')
#     cv2.imwrite(gradient_path, gradient)
#     print(f"Gradient image saved at {gradient_path}")

#     # Convert the result to grayscale for better visualization
#     gray_dst = cv2.cvtColor(gradient, cv2.COLOR_BGR2GRAY)

#     # Find contours
#     contours, _ = cv2.findContours(gray_dst, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

#     if len(contours) == 0:
#         raise ValueError('No contours found')

#     print(f"Contours found: {len(contours)}")

#     # Find the closest contour for each marker
#     closest_contours = []
#     for marker in markers:
#         min_distance = float('inf')
#         closest_contour = None
#         marker_point = np.array([marker['x'], marker['y']])
#         for contour in contours:
#             for point in contour:
#                 distance = np.linalg.norm(point - marker_point)
#                 if distance < min_distance:
#                     min_distance = distance
#                     closest_contour = contour
#         closest_contours.append(closest_contour)

#     print(f"Closest contours selected: {len(closest_contours)}")

#     # Create an empty mask to draw the closest contours
#     mask = np.zeros_like(gray_dst)
#     cv2.drawContours(mask, closest_contours, -1, (255), thickness=cv2.FILLED)

#     result_path = os.path.join(os.path.dirname(image_path), 'target_contour_output.png')
#     cv2.imwrite(result_path, mask)
    
#     if not os.path.exists(result_path):
#         print(f"Failed to save result image at {result_path}")
#     else:
#         print(f"Result image saved at {result_path}")

#     # Write the result path to a temporary file
#     temp_output_path = os.path.join(os.path.dirname(image_path), 'temp_output_path.txt')
#     with open(temp_output_path, 'w') as f:
#         f.write(result_path)
    
#     return result_path

# if __name__ == "__main__":
#     image_path = sys.argv[1]
#     markers = json.loads(sys.argv[2])
#     result_path = process_image_with_markers(image_path, markers)
#     print(result_path)



# import cv2
# import numpy as np
# import sys
# import json
# import os

# def process_image_with_markers(image_path, markers):
#     image = cv2.imread(image_path)
#     if image is None:
#         raise ValueError('Image not found')

#     print(f"Image loaded: {image.shape}")

#     # Apply morphological gradient operation
#     src = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#     dst = np.zeros_like(src)
#     ksize = (5, 5)
#     M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
#     gradient = cv2.morphologyEx(src, cv2.MORPH_GRADIENT, M)

#     print("Morphological gradient applied")

#     # Save gradient image for debugging
#     gradient_path = os.path.join(os.path.dirname(image_path), 'gradient_output.png')
#     cv2.imwrite(gradient_path, gradient)
#     print(f"Gradient image saved at {gradient_path}")

#     # Convert the result to grayscale for better visualization
#     gray_dst = cv2.cvtColor(gradient, cv2.COLOR_BGR2GRAY)

#     # Save grayscale gradient image for debugging
#     gray_gradient_path = os.path.join(os.path.dirname(image_path), 'gray_gradient_output.png')
#     cv2.imwrite(gray_gradient_path, gray_dst)
#     print(f"Grayscale gradient image saved at {gray_gradient_path}")

#     # Find contours
#     contours, _ = cv2.findContours(gray_dst, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

#     if len(contours) == 0:
#         raise ValueError('No contours found')

#     print(f"Contours found: {len(contours)}")

#     # Find the closest contour for each marker
#     closest_contours = []
#     for marker in markers:
#         min_distance = float('inf')
#         closest_contour = None
#         marker_point = np.array([marker['x'], marker['y']])
#         print(f"Processing marker: {marker_point}")
#         for contour in contours:
#             for point in contour:
#                 distance = np.linalg.norm(point[0] - marker_point)
#                 if distance < min_distance:
#                     min_distance = distance
#                     closest_contour = contour
#         if closest_contour is not None:
#             closest_contours.append(closest_contour)
#         print(f"Closest contour for marker {marker_point}: {closest_contour}")

#     if not closest_contours:
#         print("No closest contours found for any marker.")
#     else:
#         print(f"Closest contours selected: {len(closest_contours)}")

#     # Create an empty mask to draw the closest contours
#     mask = np.zeros_like(gray_dst)
#     cv2.drawContours(mask, closest_contours, -1, (255), thickness=cv2.FILLED)

#     result_path = os.path.join(os.path.dirname(image_path), 'target_contour_output.png')
#     cv2.imwrite(result_path, mask)
    
#     if not os.path.exists(result_path):
#         print(f"Failed to save result image at {result_path}")
#     else:
#         print(f"Result image saved at {result_path}")

#     # Write the result path to a temporary file
#     temp_output_path = os.path.join(os.path.dirname(image_path), 'temp_output_path.txt')
#     with open(temp_output_path, 'w') as f:
#         f.write(result_path)
    
#     return result_path

# if __name__ == "__main__":
#     image_path = sys.argv[1]
#     markers = json.loads(sys.argv[2])
#     result_path = process_image_with_markers(image_path, markers)
#     print(result_path)




# import cv2
# import numpy as np
# import sys
# import json
# import os

# def find_closest_contour(contours, point, max_distance, max_area):
#     min_dist = float('inf')
#     closest_contour = None
#     for contour in contours:
#         area = cv2.contourArea(contour)
#         print(f"Checking contour with area {area}", file=sys.stderr)
#         if area > max_area:
#             print(f"Contour with area {area} is too large, skipping.", file=sys.stderr)
#             continue
#         for contour_point in contour:
#             dist = np.linalg.norm(contour_point[0] - point)
#             if dist < min_dist and dist < max_distance:
#                 min_dist = dist
#                 closest_contour = contour
#     return closest_contour

# def process_image(image_path, markers):
#     image = cv2.imread(image_path)
#     if image is None:
#         raise ValueError('Image not found')

#     print(f"Image loaded: {image.shape}")

#     # Apply morphological gradient operation
#     src = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#     dst = np.zeros_like(src)
#     ksize = (5, 5)
#     M = cv2.getStructuringElement(cv2.MORPH_CROSS, ksize)
#     gradient = cv2.morphologyEx(src, cv2.MORPH_GRADIENT, M)

#     print("Morphological gradient applied")

#     # Save gradient image for debugging
#     gradient_path = os.path.join(os.path.dirname(image_path), 'gradient_output.png')
#     cv2.imwrite(gradient_path, gradient)
#     print(f"Gradient image saved at {gradient_path}")

#     # Convert the result to grayscale for better visualization
#     gray_dst = cv2.cvtColor(gradient, cv2.COLOR_BGR2GRAY)

#     # Apply binary thresholding
#     _, binary_image = cv2.threshold(gray_dst, 127, 255, cv2.THRESH_BINARY)

#     # Find contours
#     contours, _ = cv2.findContours(binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

#     if len(contours) == 0:
#         raise ValueError('No contours found')

#     print(f"Contours found: {len(contours)}")

#     output = image.copy()
#     max_distance = 100  # Adjusted maximum distance to consider a contour close to the marker
#     min_area = 100  # Minimum area of the contour to be considered valid
#     max_area = image.shape[0] * image.shape[1] / 3  # Adjusted maximum area for a contour to be considered valid

#     for marker in markers:
#         x, y = int(marker['x']), int(marker['y'])
#         marker_point = np.array([x, y])
#         print(f"Processing marker: {marker_point}", file=sys.stderr)
#         closest_contour = find_closest_contour(contours, marker_point, max_distance, max_area)

#         if closest_contour is not None and cv2.contourArea(closest_contour) > min_area:
#             cv2.drawContours(output, [closest_contour], -1, (0, 255, 0), 2)
#             print(f"Drew contour for marker at ({x}, {y}) with area {cv2.contourArea(closest_contour)}", file=sys.stderr)
#         else:
#             print(f"No valid contour found for marker at ({x}, {y})", file=sys.stderr)

#     result_path = os.path.join(os.path.dirname(image_path), 'target_contour_output.png')
#     cv2.imwrite(result_path, output)
#     if not os.path.exists(result_path):
#         print(f"Failed to save result image at {result_path}", file=sys.stderr)
#     else:
#         print(f"Result image saved at {result_path}", file=sys.stderr)

#     # Write the result path to a temporary file
#     temp_output_path = os.path.join(os.path.dirname(image_path), 'temp_output_path.txt')
#     with open(temp_output_path, 'w') as f:
#         f.write(result_path)
    
#     return result_path

# if __name__ == "__main__":
#     image_path = sys.argv[1]
#     markers = json.loads(sys.argv[2])
#     result_path = process_image(image_path, markers)
#     print(result_path)
