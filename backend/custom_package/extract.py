import pandas as pd
import io
import cv2  
import pytesseract  
from PIL import Image
from pyspark.sql import SparkSession
from pyspark.sql.functions import pandas_udf
from pyspark.sql.functions import udf
from docx2pdf import convert
import re
from pyspark.sql import Row  
from pyspark.sql.functions import col, regexp_extract
from pyspark.sql import functions as F
from PIL import Image, ImageDraw  
import numpy as np
import ast
import os
import re
import unicodedata
import fitz
import pandas as pd
pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe' 


class Extract:
    def __init__(self, df=None):
        self.df = df

    def intersection_over_union(self, box1, box2):
        # Calculate intersection
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])

        intersection = max(0, x2 - x1) * max(0, y2 - y1)

        # Calculate areas
        box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
        box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])

        # Calculate IoU
        iou = intersection / float(box1_area + box2_area - intersection)
        return iou

    def chevauchement(self, results):
        chevauchements = []
        for i in range(len(results)):
            if results[i]['class'] != 2:
                for j in range(i + 1, len(results)):
                    iou = self.intersection_over_union(results[i]['bbox'], results[j]['bbox'])
                    if iou > 0:  # Adjust threshold as needed
                        chevauchements.append((results[i]['class'], results[j]['class'], iou, results[i]['bbox']))
        return chevauchements

    def extract_text_from_image(self, image_bytes, bounding_boxes=None, flag=True, *args):
        custom_config = r'--oem 3 --psm 6 -l fra'
        image = Image.open(io.BytesIO(image_bytes))
        extracted_text = ""

        # Create a copy of the original image to draw on
        image_with_boxes = image.copy()

        if flag:
            x1, y1, x2, y2 = bounding_boxes
            cropped_image = image.crop((x1, y1, x2, y2))
            extracted_text += pytesseract.image_to_string(cropped_image, config=custom_config) + "\n"

        else:
            if bounding_boxes is None:
                bounding_boxes = [0, 0, *image.size]

            # Draw rectangles for bounding boxes
            draw = ImageDraw.Draw(image_with_boxes)
            for box in args:
                draw.rectangle(box, outline="white", width=2)
            for box in args:
                draw.rectangle(box, fill="black")  # Filling the rectangle to hide text

            # Crop the specified bounding box
            x1, y1, x2, y2 = bounding_boxes
            cropped_image = image_with_boxes.crop((x1, y1, x2, y2))
            extracted_text += pytesseract.image_to_string(cropped_image, config=custom_config) + "\n"

        return extracted_text

    def extract(self):
        print('Start Extract Process')
        all_texts = []
        for index, row in self.df.iterrows():
            predictions = row['predictions']
            # Extract the base name of image and number of page
            file_name_with_ext = os.path.basename(row['path_of_image'])
            file_name = os.path.splitext(file_name_with_ext)[0]
            match = re.search(r'(.*)_page_(\d+)$', file_name)
            base_name = match.group(1) if match else file_name

            with open(row['path_of_image'], 'rb') as img_file:
                image_bytes = img_file.read()

            if len(predictions) == 0:
                image = Image.open(io.BytesIO(image_bytes))
                text = pytesseract.image_to_string(image, config='--oem 3 --psm 6 -l fra')
                text = re.sub(r'"""', '', text)

                for txt in all_texts:
                    file_name_with_ext_txt = os.path.basename(txt['path_of_image'])
                    file_name_txt = os.path.splitext(file_name_with_ext_txt)[0]
                    match = re.search(r'(.*)_page_(\d+)$', file_name_txt)
                    base_name_txt = match.group(1) if match else file_name_txt
                    if base_name_txt == base_name :
                        txt['text'] += text
                        break
                else:
                    all_texts.append({
                        'path_of_image': row['path_of_image'],
                        'text': text
                    })

                # with open(f"extracted/{base_name}.txt", "a", encoding="utf-8") as file:
                #     file.write(text)

            else:
                class_list = []
                bbox = []
                chevauchement_list = self.chevauchement(predictions)
                if chevauchement_list:
                    first_element = [t[0] for t in chevauchement_list]
                    second_element = [t[1] for t in chevauchement_list]
                    class_list = [first_element[0], *second_element]
                    bbox = [t[3] for t in chevauchement_list][0]

                extracted_text = []
                text = ""
                for item in predictions:
                    if item['class'] in class_list:
                        if item['class'] == class_list[0] and item['bbox'] == bbox:
                            bounding = [
                                box['bbox'] for cls in class_list[1:]
                                for box in predictions if box['class'] == cls and box['bbox'] != bbox
                            ]
                            extracted_text.append(
                                (item['class'] + 1, self.extract_text_from_image(image_bytes, item['bbox'], False, *bounding))
                            )
                        else:
                            extracted_text.append(
                                (item['class'] + 1, self.extract_text_from_image(image_bytes, item['bbox']))
                            )
                    else:
                        if item['class'] != 2:
                            extracted_text.append(
                                (item['class'] + 1, self.extract_text_from_image(image_bytes, item['bbox']))
                            )

                bounding = [box['bbox'] for box in predictions]
                extracted_text.append((7, self.extract_text_from_image(image_bytes, None, False, *bounding)))

                extracted_text = sorted(extracted_text, key=lambda x: x[0])

                for value_ in extracted_text:
                    text += value_[1]

                text = re.sub(r'"""', '', text)

                for txt in all_texts:
                    file_name_with_ext_txt = os.path.basename(txt['path_of_image'])
                    file_name_txt = os.path.splitext(file_name_with_ext_txt)[0]
                    match = re.search(r'(.*)_page_(\d+)$', file_name_txt)
                    base_name_txt = match.group(1) if match else file_name_txt
                    if base_name_txt == base_name :
                        txt['text'] += text
                        break
                else:
                    all_texts.append({
                        'path_of_image': row['path_of_image'],
                        'text': text
                    })

                # with open(f"extracted/{base_name}.txt", "a", encoding="utf-8") as file:
                #     file.write(text)

        print('End Extract Process')

        return all_texts



