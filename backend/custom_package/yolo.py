from ultralytics import YOLO

class CustomYolo():
    
    def __init__(self, src = None) :
        self.src = src
        self.imgsz = 640
        self.conf = 0.5
        self.iou = 0.5 
        self.model = self.load_model()
    def load_model(self):
        self.model = YOLO('../model/weights/best.pt')
        return self.model
    def detect(self):
        all_predictions = []

        # Perform detection
        for sr in self.src :
            result = self.model.predict(source=sr, conf=self.conf, iou=self.iou)
            boxes = result[0].boxes
            # Extract classes
            classes = boxes.cls.tolist()

            # Extract confidence scores
            confidences = boxes.conf.tolist()

            # Extract bounding boxes (in xyxy format)
            bounding_boxes = boxes.xyxy.tolist()

            # Combine the information
            results = []
            for cls, conf, bbox in zip(classes, confidences, bounding_boxes):
                results.append({
                    'class': int(cls),  # Convert to integer
                    'confidence': conf,
                    'bbox': bbox
                })

            all_predictions.append({
                'path_of_image': sr,  # Use path as key
                'predictions': results
            })
            
        return all_predictions


    
